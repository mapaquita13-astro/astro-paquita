"""Adaptateur privé : exécute Astro Paquita V188 original (sans réécrire les calculs)."""
import asyncio
import hmac
import json
import os
import re
from datetime import datetime, date
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field, field_validator
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

APP_URL=os.getenv("ASTRO_APP_URL","https://astro-paquita.onrender.com/app-v121.html")
API_URL=os.getenv("ASTRO_BACKEND_URL","https://astro-paquita-backend.onrender.com").rstrip("/")
TOKEN=os.getenv("ASTRO_GENERATOR_TOKEN","")
MAIL=os.getenv("ASTRO_SERVICE_EMAIL","")
PASSWORD=os.getenv("ASTRO_SERVICE_PASSWORD","")
LOCK=asyncio.Semaphore(1)

class Period(BaseModel):
    start: date
    months: int
    @field_validator("months")
    @classmethod
    def only_twelve(cls,value):
        if value != 12: raise ValueError("Ce produit couvre douze mois")
        return value

class Profile(BaseModel):
    prenom: str=Field(min_length=1,max_length=70)
    date: str
    heure: str
    ville: str=Field(min_length=3,max_length=140)
    lat: float=Field(ge=-90,le=90)
    lon: float=Field(ge=-180,le=180)
    tz: str
    timeStatus: str
    @field_validator("date")
    @classmethod
    def date_fr(cls,value):
        datetime.strptime(value,"%d/%m/%Y")
        return value
    @field_validator("heure")
    @classmethod
    def hour(cls,value):
        if not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d",value):
            raise ValueError("Heure invalide")
        return value
    @field_validator("timeStatus")
    @classmethod
    def exact(cls,value):
        if value!="exact": raise ValueError("Heure exacte requise")
        return value

class Request(BaseModel):
    schemaVersion: int
    period: Period
    profile: Profile
    @field_validator("schemaVersion")
    @classmethod
    def ver(cls,value):
        if value!=1: raise ValueError("Version inconnue")
        return value

def configured():
    if len(TOKEN)<32 or not MAIL or not PASSWORD: return False
    for raw in [APP_URL,API_URL]:
        p=urlparse(raw)
        if p.scheme!="https" or not p.hostname or p.username or p.password: return False
    return True

async def login():
    async with httpx.AsyncClient(timeout=25,follow_redirects=False) as client:
        r=await client.post(API_URL+"/api/auth/login",json={"email":MAIL,"motDePasse":PASSWORD})
        r.raise_for_status()
        bearer=r.json().get("token")
        if not isinstance(bearer,str) or len(bearer)<20: raise RuntimeError("AUTH_LOGIN")
        r=await client.get(API_URL+"/api/me",headers={"Authorization":"Bearer "+bearer})
        r.raise_for_status()
        account=r.json()
        if account.get("role")!="admin" and account.get("premium") is not True:
            raise RuntimeError("AUTH_NOT_PREMIUM")
        return bearer

async def compute(payload,bearer):
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=["--no-sandbox"])
        context=await browser.new_context(locale="fr-FR",timezone_id="Europe/Paris")
        await context.add_init_script(script="try { localStorage.setItem('astro-token',"+json.dumps(bearer)+") } catch(_){}")
        async def no_profile_sync(route):
            await route.fulfill(status=200,content_type="application/json",
                body='{"succes":true,"profiles":[],"skipped":true,"reason":"isolation"}')
        await context.route("**/api/me/profiles/sync",no_profile_sync)
        try:
            page=await context.new_page()
            await page.goto(APP_URL,wait_until="domcontentloaded",timeout=60000)
            frame=None
            for _ in range(240):
                for candidate in page.frames:
                    try:
                        ready=await candidate.evaluate("""() => !!(window.AstroTruth && window.__AP_V188_FORECAST__ &&
                            document.querySelector('#ap-run-forecast') && document.querySelector('.ap-forecast-period-nav'))""")
                        if ready: frame=candidate;break
                    except Exception: pass
                if frame is not None: break
                await asyncio.sleep(.25)
            if frame is None: raise RuntimeError("ORIGINAL_RUNTIME_UNAVAILABLE")
            await frame.wait_for_function("""() => !!(window.USER_CONNECTE &&
                (window.USER_CONNECTE.role==='admin'||window.USER_CONNECTE.premium===true)) &&
                document.body.classList.contains('ap-premium-user')""",timeout=45000)
            b=payload.profile.model_dump()
            b["start"]=payload.period.start.isoformat()
            version=await frame.evaluate("""(a) => {
                const A=window.AstroTruth;
                const p=A.saveProfile({prenom:a.prenom,date:a.date,heure:a.heure,
                    ville:a.ville,lat:a.lat,lon:a.lon,tz:a.tz,timeStatus:'exact',genre:'N'});
                const val=A.validation(p);
                if(!val.ok || !A.activate(p.profileId))throw Error('PROFILE_INVALID');
                document.body.classList.add('ap-route-forecast');
                document.querySelectorAll('.ap-period-choice').forEach(n=>
                    n.classList.toggle('active',n.dataset.per==='annee'));
                document.querySelectorAll('.ap-domain-choice').forEach(n=>
                    n.classList.toggle('active',n.dataset.domain==='all'));
                const nav=document.querySelector('.ap-forecast-period-nav');
                if(!nav)throw Error('NAV_UNAVAILABLE');
                nav.dataset.v174Anchor=a.start;
                nav.dataset.v174Days='365';
                return String(A.ENGINE_VERSION||'')+'/'+String(A.TRUTH_VERSION||'');
            }""",b)
            await frame.locator("#ap-run-forecast").click(timeout=15000)
            await frame.wait_for_function("""() => {
                const e=document.querySelector('#ap-forecast-error');
                if(e?.classList.contains('show') && e.textContent?.trim())
                    throw Error('FORECAST_FAILED');
                const out=document.querySelector('#ap-v187-report');
                const spinner=document.querySelector('#ap-v187-ai');
                return !!(out && out.innerText.trim().length &&
                    (!spinner||!spinner.classList.contains('show')));
            }""",timeout=150000)
            report=await frame.locator("#ap-v187-report").evaluate("""e => ({
                text:e.innerText, isFallback:!!e.querySelector('.ap-aspect-list')
            })""")
            text=report.get("text","").strip()
            if report.get("isFallback") or len(text)<200 or len(text)>150000:
                raise RuntimeError("ORIGINAL_REPORT_INCOMPLETE")
            if "prend trop de temps" in text.lower():
                raise RuntimeError("ORIGINAL_AI_FALLBACK")
            return {"engine":"AstroPaquita","sourceVersion":version[:80]+"+v188",
                    "sections":[{"title":"Vos prévisions sur douze mois","text":text}]}
        finally:
            await context.close()
            await browser.close()

app=FastAPI(title="Adaptateur Astro Paquita prive",docs_url=None,redoc_url=None,openapi_url=None)
@app.get("/health")
async def health():
    return {"service":"astro-paquita-private-adapter","configured":configured(),
            "originalEngineVerified":False,"mode":"locked-until-service-account"}

@app.post("/forecast")
async def forecast(payload:Request,authorization:str|None=Header(None)):
    if not configured(): raise HTTPException(503,"Compte technique non configure")
    supplied=(authorization or "").removeprefix("Bearer ")
    if not hmac.compare_digest(supplied,TOKEN): raise HTTPException(401,"Non autorise")
    async with LOCK:
        try:
            bearer=await login()
            return await compute(payload,bearer)
        except (RuntimeError,ValueError,PWTimeout,httpx.HTTPError):
            raise HTTPException(502,"Generation des previsions originales impossible")
