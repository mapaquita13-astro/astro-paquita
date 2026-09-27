/* Astro Paquita — traduction globale FR / EN / ES / AR.
   La langue choisie s'applique a toutes les pages nouvellement rendues et aux rapports IA.
   Aucun calcul astrologique n'est modifie. */
(function(){
'use strict';
if(window.__AP_GLOBAL_I18N__)return;
window.__AP_GLOBAL_I18N__=true;

const META={fr:{locale:'fr-FR',dir:'ltr',ai:'français'},en:{locale:'en-GB',dir:'ltr',ai:'English'},es:{locale:'es-ES',dir:'ltr',ai:'español'},ar:{locale:'ar',dir:'rtl',ai:'العربية'}};
const D={};
function add(fr,en,es,ar){D[fr]={fr,en,es,ar};}

// Navigation et libelles generaux
add('Accueil','Home','Inicio','الرئيسية');
add('Portrait','Portrait','Retrato','الخريطة');
add('Avenir','Future','Futuro','المستقبل');
add('Plus','More','Más','المزيد');
add('Mon compte','My account','Mi cuenta','حسابي');
add('Compte gratuit','Free account','Cuenta gratuita','حساب مجاني');
add('Premium','Premium','Premium','بريميوم');
add('Aujourd’hui','Today','Hoy','اليوم');
add('Prévisions','Forecasts','Previsiones','التوقعات');
add('Prévisions détaillées','Detailed forecasts','Previsiones detalladas','توقعات مفصلة');
add('Calendrier','Calendar','Calendario','التقويم');
add('Mon calendrier','My calendar','Mi calendario','تقويمي');
add('Portrait natal','Birth chart portrait','Retrato natal','الخريطة الميلادية');
add('Mon portrait natal','My birth chart portrait','Mi retrato natal','خريطتي الميلادية');
add('Mon avenir','My future','Mi futuro','مستقبلي');
add('Le bon moment','Best timing','El mejor momento','أفضل توقيت');
add('Relations & Synastrie','Relationships & Synastry','Relaciones y sinastría','العلاقات والتوافق');
add('Portrait enfant','Child portrait','Retrato infantil','خريطة الطفل');
add('Profil & paramètres','Profile & settings','Perfil y ajustes','الملف والإعدادات');
add('Mon profil','My profile','Mi perfil','ملفي');
add('Profil','Profile','Perfil','الملف');
add('Paramètres','Settings','Ajustes','الإعدادات');
add('Langue','Language','Idioma','اللغة');
add('Enregistrer','Save','Guardar','حفظ');
add('Annuler','Cancel','Cancelar','إلغاء');
add('Supprimer','Delete','Eliminar','حذف');
add('Modifier','Edit','Modificar','تعديل');
add('Utiliser','Use','Usar','استخدام');
add('Nouveau','New','Nuevo','جديد');
add('Résultat','Result','Resultado','النتيجة');
add('Analyse personnalisée','Personalised analysis','Análisis personalizado','تحليل مخصص');
add('Général','General','General','عام');
add('Tous','All','Todos','الكل');
add('Amour','Love','Amor','الحب');
add('Travail','Work','Trabajo','العمل');
add('Argent','Money','Dinero','المال');
add('Bien-être','Well-being','Bienestar','الرفاه');
add('Famille','Family','Familia','العائلة');
add('Voyage','Travel','Viaje','السفر');
add('Date','Date','Fecha','التاريخ');
add('Heure','Time','Hora','الوقت');
add('Prénom','First name','Nombre','الاسم');
add('Email','Email','Correo electrónico','البريد الإلكتروني');
add('Mot de passe','Password','Contraseña','كلمة المرور');

// Accueil
add('Chaque jour est une nouvelle page','Every day is a new page','Cada día es una nueva página','كل يوم صفحة جديدة');
add('de votre histoire.','of your story.','de tu historia.','من قصتك.');
add('Le ciel d’aujourd’hui','Today’s sky','El cielo de hoy','سماء اليوم');
add('Votre climat personnel','Your personal climate','Tu clima personal','مناخك الشخصي');
add('Une lecture calculée à partir de votre thème et des transits du jour.','A reading calculated from your birth chart and today’s transits.','Una lectura calculada a partir de tu carta natal y los tránsitos del día.','قراءة محسوبة انطلاقاً من خريطتك الميلادية وعبور اليوم.');
add('Voir mon horoscope du jour →','See today’s forecast →','Ver mi previsión de hoy →','عرض توقعات اليوم ←');
add('portrait natal','birth chart','retrato natal','الخريطة الميلادية');
add('avenir','future','futuro','المستقبل');
add('Le bon','Best','El mejor','أفضل');
add('moment','timing','momento','توقيت');
add('Relations','Relationships','Relaciones','العلاقات');
add('& Synastrie','& Synastry','y sinastría','والتوافق');
add('enfant','child','infantil','الطفل');
add('calendrier','calendar','calendario','التقويم');
add('« Les astres ne décident pas pour vous,','“The stars do not decide for you,','« Los astros no deciden por ti,','«النجوم لا تقرر عنك،');
add('ils éclairent vos choix. »','they illuminate your choices.”','iluminan tus decisiones. »','بل تضيء اختياراتك.»');
add('Votre ciel,','Your sky,','Tu cielo,','سماؤك،');
add('votre rythme.','your rhythm.','tu ritmo.','إيقاعك.');
add('Calcul du climat du jour, sans remplissage artificiel.','Today’s climate is calculated without artificial filler.','El clima del día se calcula sin relleno artificial.','يُحسب مناخ اليوم دون حشو مصطنع.');
add('Planètes, angles, maisons et lecture de fond.','Planets, angles, houses and in-depth reading.','Planetas, ángulos, casas y lectura de fondo.','الكواكب والزوايا والبيوت وقراءة متعمقة.');
add('Jour, semaine, mois, trimestre, année ou date précise.','Day, week, month, quarter, year or specific date.','Día, semana, mes, trimestre, año o fecha concreta.','يوم أو أسبوع أو شهر أو ربع سنة أو سنة أو تاريخ محدد.');
add('Aspects inter-thèmes réellement calculés.','Actually calculated inter-chart aspects.','Aspectos entre cartas realmente calculados.','جوانب بين الخريطتين محسوبة فعلياً.');
add('Le même moteur, vu jour par jour.','The same engine, viewed day by day.','El mismo motor, visto día a día.','المحرك نفسه، يوماً بعد يوم.');

// Bandeaux visuels
add('Votre carte du ciel','Your birth chart','Tu carta natal','خريطتك الميلادية');
add('Un portrait de fond, lisible et personnel.','An in-depth, clear and personal portrait.','Un retrato profundo, claro y personal.','صورة معمقة وواضحة وشخصية.');
add('Votre horizon','Your horizon','Tu horizonte','أفقك');
add('Choisissez la lecture qui vous est utile.','Choose the reading that is useful to you.','Elige la lectura que te resulte útil.','اختر القراءة التي تفيدك.');
add('Vos prévisions','Your forecasts','Tus previsiones','توقعاتك');
add('Une période, un domaine, une lecture claire.','One period, one area, one clear reading.','Un período, un ámbito, una lectura clara.','فترة ومجال وقراءة واضحة.');
add('Chercher les périodes les plus porteuses pour votre objectif.','Find the most supportive periods for your goal.','Buscar los períodos más favorables para tu objetivo.','البحث عن الفترات الأكثر دعماً لهدفك.');
add('Comprendre ses forces, ses sensibilités et ses besoins.','Understand their strengths, sensitivities and needs.','Comprender sus fortalezas, sensibilidades y necesidades.','فهم نقاط القوة والحساسيات والاحتياجات.');
add('Votre calendrier','Your calendar','Tu calendario','تقويمك');
add('Le détail d’une journée quand vous en avez besoin.','A detailed day reading whenever you need it.','El detalle de un día cuando lo necesites.','تفاصيل يوم عندما تحتاج إليها.');
add('Vos profils','Your profiles','Tus perfiles','ملفاتك');
add('Des données de naissance précises pour des calculs fiables.','Accurate birth data for reliable calculations.','Datos de nacimiento precisos para cálculos fiables.','بيانات ميلاد دقيقة لحسابات موثوقة.');

// Ecran Mon avenir simplifie
add('Votre avenir','Your future','Tu futuro','مستقبلك');
add('Qu’avez-vous envie de regarder ?','What would you like to explore?','¿Qué quieres consultar?','ماذا تريد أن تستكشف؟');
add('Choisissez directement l’analyse qui vous intéresse.','Choose the analysis you want directly.','Elige directamente el análisis que te interesa.','اختر مباشرة التحليل الذي يهمك.');
add('Mes prévisions','My forecasts','Mis previsiones','توقعاتي');
add('Choisissez une période et un domaine : aujourd’hui, semaine, mois, 3 mois, 12 mois ou une date précise.','Choose a period and an area: today, week, month, 3 months, 12 months or a specific date.','Elige un período y un ámbito: hoy, semana, mes, 3 meses, 12 meses o una fecha concreta.','اختر فترة ومجالاً: اليوم أو أسبوع أو شهر أو 3 أشهر أو 12 شهراً أو تاريخاً محدداً.');
add('Recherchez les fenêtres les plus intéressantes pour un objectif précis, sur la période que vous choisissez.','Find the most supportive windows for a specific goal over the period you choose.','Busca las ventanas más interesantes para un objetivo concreto durante el período que elijas.','ابحث عن أفضل الفترات لهدف محدد ضمن المدة التي تختارها.');
add('Choisissez une date pour consulter la lecture détaillée de cette journée.','Choose a date to see the detailed reading for that day.','Elige una fecha para consultar la lectura detallada de ese día.','اختر تاريخاً للاطلاع على القراءة المفصلة لذلك اليوم.');

// Previsions
add('Des analyses claires et personnalisées','Clear, personalised analyses','Análisis claros y personalizados','تحليلات واضحة ومخصصة');
add('Choisissez une période','Choose a period','Elige un período','اختر فترة');
add('Cette semaine','This week','Esta semana','هذا الأسبوع');
add('Ce mois','This month','Este mes','هذا الشهر');
add('3 prochains mois','Next 3 months','Próximos 3 meses','الأشهر الثلاثة القادمة');
add('12 prochains mois','Next 12 months','Próximos 12 meses','الأشهر الاثنا عشر القادمة');
add('Date précise','Specific date','Fecha concreta','تاريخ محدد');
add('Choisissez un domaine','Choose an area','Elige un ámbito','اختر مجالاً');
add('Choisissez d’abord quand vous voulez regarder, puis le domaine concerné. Les deux critères sont analysés ensemble.','First choose when you want to look, then the relevant area. Both criteria are analysed together.','Primero elige cuándo quieres mirar y después el ámbito. Ambos criterios se analizan juntos.','اختر أولاً الفترة ثم المجال المعني. يتم تحليل المعيارين معاً.');
add('1. La période répond à « quand ? »  ·  2. Le domaine répond à « sur quoi ? »','1. The period answers “when?” · 2. The area answers “what about?”','1. El período responde «¿cuándo?» · 2. El ámbito responde «¿sobre qué?»','1. الفترة تجيب «متى؟» · 2. المجال يجيب «عن ماذا؟»');
add('Générer mes prévisions →','Generate my forecasts →','Generar mis previsiones →','إنشاء توقعاتي ←');
add('Une analyse personnalisée, adaptée à votre thème et à vos objectifs.','A personalised analysis adapted to your chart and goals.','Un análisis personalizado adaptado a tu carta y a tus objetivos.','تحليل مخصص يتكيف مع خريطتك وأهدافك.');

// Bon moment
add('Fenêtre idéale','Ideal window','Ventana ideal','الفترة المثالية');
add('Votre intention','Your goal','Tu objetivo','هدفك');
add('Amour / relation','Love / relationship','Amor / relación','الحب / العلاقة');
add('Travail / évolution','Work / career development','Trabajo / evolución','العمل / التطور');
add('Argent / finances','Money / finances','Dinero / finanzas','المال / الشؤون المالية');
add('Famille / déménagement','Family / moving home','Familia / mudanza','العائلة / الانتقال');
add('Créer / lancer un projet','Create / launch a project','Crear / lanzar un proyecto','إنشاء / إطلاق مشروع');
add('Études / examen','Studies / exam','Estudios / examen','الدراسة / الامتحان');
add('Période analysée','Analysed period','Período analizado','الفترة المحللة');
add('Aucune fenêtre suffisamment confirmée','No sufficiently confirmed window','Ninguna ventana suficientemente confirmada','لا توجد فترة مؤكدة بما يكفي');
add('Aucune date ne réunit assez de confirmations astrologiques propres à cette intention sur la période choisie. Le site ne complète pas artificiellement le résultat.','No date gathers enough astrological confirmations for this goal over the chosen period. The site does not artificially fill the result.','Ninguna fecha reúne suficientes confirmaciones astrológicas para este objetivo durante el período elegido. El sitio no rellena artificialmente el resultado.','لا يجمع أي تاريخ تأكيدات فلكية كافية لهذا الهدف ضمن الفترة المختارة. لا يملأ الموقع النتيجة بشكل مصطنع.');
add('Fenêtre la plus soutenue','Most supportive window','Ventana más favorable','الفترة الأكثر دعماً');
add('Autre fenêtre intéressante','Another interesting window','Otra ventana interesante','فترة أخرى مهمة');
add('Très convergente','Highly convergent','Muy convergente','متوافقة جداً');
add('Confirmée','Confirmed','Confirmada','مؤكدة');
add('Signal plus léger','Lighter signal','Señal más ligera','إشارة أخف');
add('Choisissez une période valide.','Choose a valid period.','Elige un período válido.','اختر فترة صالحة.');
add('La recherche commence aujourd’hui ou dans le futur.','The search starts today or in the future.','La búsqueda empieza hoy o en el futuro.','يبدأ البحث من اليوم أو في المستقبل.');
add('La période maximale est de 10 ans.','The maximum period is 10 years.','El período máximo es de 10 años.','المدة القصوى هي 10 سنوات.');

// Relations et synastrie
add('Deux thèmes · une relation','Two charts · one relationship','Dos cartas · una relación','خريطتان · علاقة واحدة');
add('Comparer avec','Compare with','Comparar con','المقارنة مع');
add('Type de relation','Relationship type','Tipo de relación','نوع العلاقة');
add('Analyser','Analyse','Analizar','تحليل');
add('Aspects calculés','Calculated aspects','Aspectos calculados','الجوانب المحسوبة');
add('Sélectionnez un profil et un contexte.','Select a profile and a context.','Selecciona un perfil y un contexto.','اختر ملفاً وسياقاً.');
add('Analyse relationnelle','Relationship analysis','Análisis de la relación','تحليل العلاقة');
add('Votre dynamique relationnelle','Your relationship dynamic','Tu dinámica relacional','ديناميكية علاقتك');
add('Sélectionnez un profil et le type de lien.','Select a profile and relationship type.','Selecciona un perfil y el tipo de vínculo.','اختر ملفاً ونوع العلاقة.');
add('Dans le temps','Over time','A lo largo del tiempo','عبر الزمن');
add('Prévisions du couple','Couple forecasts','Previsiones de pareja','توقعات العلاقة');
add('Prévisions relationnelles','Relationship forecasts','Previsiones relacionales','توقعات العلاقة');
add('Après l’analyse de votre dynamique, regardez comment le lien évolue dans le temps : périodes porteuses, moments plus sensibles et conseils adaptés au couple.','After analysing your dynamic, see how the relationship evolves over time: supportive periods, more sensitive moments and advice for the couple.','Después de analizar vuestra dinámica, observa cómo evoluciona la relación: períodos favorables, momentos más sensibles y consejos adaptados a la pareja.','بعد تحليل ديناميكية العلاقة، راقب كيف تتطور مع الوقت: فترات داعمة ولحظات أكثر حساسية ونصائح مناسبة للعلاقة.');
add('Après l’analyse du lien, regardez comment la relation évolue dans le temps : périodes porteuses, moments plus sensibles et conseils adaptés au contexte choisi.','After analysing the bond, see how the relationship evolves over time: supportive periods, more sensitive moments and advice suited to the chosen context.','Después de analizar el vínculo, observa cómo evoluciona la relación: períodos favorables, momentos más sensibles y consejos adaptados al contexto elegido.','بعد تحليل الرابط، راقب تطور العلاقة عبر الزمن: فترات داعمة ولحظات أكثر حساسية ونصائح مناسبة للسياق المختار.');
add('Période à analyser','Period to analyse','Período a analizar','الفترة المراد تحليلها');
add('30 prochains jours','Next 30 days','Próximos 30 días','الأيام الثلاثون القادمة');
add('6 prochains mois','Next 6 months','Próximos 6 meses','الأشهر الستة القادمة');
add('2 prochaines années','Next 2 years','Próximos 2 años','السنتان القادمتان');
add('3 prochaines années','Next 3 years','Próximos 3 años','Próximos 3 años','السنوات الثلاث القادمة');
add('5 prochaines années','Next 5 years','Próximos 5 años','السنوات الخمس القادمة');
add('Autour d’une date précise','Around a specific date','Alrededor de una fecha concreta','حول تاريخ محدد');
add('Date à analyser','Date to analyse','Fecha a analizar','التاريخ المراد تحليله');
add('Analyser les prévisions','Analyse forecasts','Analizar las previsiones','تحليل التوقعات');
add('Analyse de la relation dans le temps…','Analysing the relationship over time…','Analizando la relación a lo largo del tiempo…','جارٍ تحليل العلاقة عبر الزمن…');
add('Ce qui vous attend ensemble','What lies ahead together','Lo que os espera juntos','ما ينتظركما معاً');
add('Sélectionnez la période puis lancez l’analyse. Les prévisions utilisent le même couple de profils que la synastrie ci-dessus.','Select the period, then start the analysis. The forecasts use the same pair of profiles as the synastry above.','Selecciona el período y lanza el análisis. Las previsiones utilizan la misma pareja de perfiles que la sinastría anterior.','اختر الفترة ثم ابدأ التحليل. تستخدم التوقعات نفس الملفين المستخدمين في التوافق أعلاه.');
add('Prévisions relationnelles en cours…','Relationship forecasts in progress…','Previsiones relacionales en curso…','جارٍ إعداد توقعات العلاقة…');
add('Sélectionnez un second profil.','Select a second profile.','Selecciona un segundo perfil.','اختر ملفاً ثانياً.');
add('Choisissez une date à analyser.','Choose a date to analyse.','Elige una fecha para analizar.','اختر تاريخاً للتحليل.');

// Portrait natal et enfant
add('Chemin karmique','Karmic path','Camino kármico','المسار الكارمي');
add('Lire mon portrait complet','Read my full portrait','Leer mi retrato completo','قراءة تحليلي الكامل');
add('carte du ciel','birth chart','carta natal','الخريطة الميلادية');
add('Portrait','Portrait','Retrato','التحليل');
add('Même thème · autre langage','Same chart · different language','Misma carta · otro lenguaje','الخريطة نفسها · لغة مختلفة');
add('Enfant','Child','Niño/a','الطفل');
add('Aucun profil de moins de 18 ans n’est enregistré.','No profile under 18 is registered.','No hay ningún perfil menor de 18 años registrado.','لا يوجد ملف مسجل لمن هو دون 18 عاماً.');
add('Le portrait met l’accent sur tempérament, besoins, apprentissage, relations, confiance et points d’appui.','The portrait focuses on temperament, needs, learning, relationships, confidence and strengths.','El retrato se centra en temperamento, necesidades, aprendizaje, relaciones, confianza y puntos de apoyo.','يركز التحليل على الطبع والاحتياجات والتعلم والعلاقات والثقة ونقاط القوة.');

// Calendrier
add('Jour après jour','Day by day','Día a día','يوماً بعد يوم');
add('Note personnelle','Personal note','Nota personal','ملاحظة شخصية');
add('Votre note…','Your note…','Tu nota…','ملاحظتك…');
add('Note enregistrée.','Note saved.','Nota guardada.','تم حفظ الملاحظة.');
add('Période calme','Calm period','Período tranquilo','فترة هادئة');

// Profil
add('Vos données','Your data','Tus datos','بياناتك');
add('Profils','Profiles','Perfiles','الملفات');
add('+ Nouveau','+ New','+ Nuevo','+ جديد');
add('Nouveau profil','New profile','Nuevo perfil','ملف جديد');
add('Modifier le profil','Edit profile','Modificar perfil','تعديل الملف');
add('Date de naissance','Date of birth','Fecha de nacimiento','تاريخ الميلاد');
add('Précision de l’heure','Time accuracy','Precisión de la hora','دقة الوقت');
add('Heure exacte','Exact time','Hora exacta','وقت دقيق');
add('Heure approximative','Approximate time','Hora aproximada','وقت تقريبي');
add('Heure inconnue','Unknown time','Hora desconocida','وقت غير معروف');
add('Lieu de naissance validé','Validated place of birth','Lugar de nacimiento validado','مكان الميلاد المؤكد');
add('Tapez au moins 2 lettres…','Type at least 2 letters…','Escribe al menos 2 letras…','اكتب حرفين على الأقل…');
add('Latitude','Latitude','Latitud','خط العرض');
add('Longitude','Longitude','Longitud','خط الطول');
add('Fuseau IANA','IANA timezone','Zona horaria IANA','المنطقة الزمنية IANA');
add('Genre / pronoms','Gender / pronouns','Género / pronombres','الجنس / الضمائر');
add('Non précisé','Not specified','No especificado','غير محدد');
add('Femme','Woman','Mujer','امرأة');
add('Homme','Man','Hombre','رجل');
add('Sans nom','Unnamed','Sin nombre','بدون اسم');
add('✓ données validées','✓ validated data','✓ datos validados','✓ بيانات مؤكدة');
add('⚠ données à compléter','⚠ data to complete','⚠ datos por completar','⚠ بيانات تحتاج إلى استكمال');
add('Profil actif.','Profile activated.','Perfil activado.','تم تفعيل الملف.');
add('Profil enregistré.','Profile saved.','Perfil guardado.','تم حفظ الملف.');
add('Profil supprimé.','Profile deleted.','Perfil eliminado.','تم حذف الملف.');
add('La langue ne modifie jamais les calculs : elle change uniquement l’affichage et l’interprétation. L’arabe active automatiquement le sens RTL.','Language never changes the calculations: it only changes the display and interpretation. Arabic automatically enables RTL.','El idioma nunca cambia los cálculos: solo modifica la visualización y la interpretación. El árabe activa automáticamente RTL.','اللغة لا تغيّر الحسابات أبداً، بل تغيّر العرض والتفسير فقط. العربية تفعّل اتجاه الكتابة من اليمين إلى اليسار تلقائياً.');

// Authentification
add('ÉCLAIREZ VOTRE CHEMIN','LIGHT YOUR PATH','ILUMINA TU CAMINO','أَضِئْ طريقك');
add('Votre vie a un sens.','Your life has meaning.','Tu vida tiene un sentido.','لحياتك معنى.');
add('Les astres vous aident','The stars help you','Los astros te ayudan','تساعدك النجوم');
add('à le trouver.','find it.','a encontrarlo.','على اكتشافه.');
add('Des analyses','Personalised','Análisis','تحليلات');
add('personnalisées','analyses','personalizados','مخصصة');
add('Des réponses','Insightful','Respuestas','إجابات');
add('éclairantes','answers','esclarecedoras','مضيئة');
add('Un accompagnement','Everyday','Acompañamiento','مرافقة');
add('au quotidien','guidance','cotidiano','يومية');
add('Bienvenue !','Welcome!','¡Bienvenido/a!','مرحباً!');
add('Créez votre compte et commencez votre voyage astral','Create your account and begin your astrological journey','Crea tu cuenta y comienza tu viaje astral','أنشئ حسابك وابدأ رحلتك الفلكية');
add('Connexion','Sign in','Iniciar sesión','تسجيل الدخول');
add('Inscription','Sign up','Registrarse','إنشاء حساب');
add('Se connecter','Sign in','Iniciar sesión','تسجيل الدخول');
add('Créer mon compte','Create my account','Crear mi cuenta','إنشاء حسابي');
add('Connexion…','Signing in…','Conectando…','جارٍ تسجيل الدخول…');
add('Vos données sont protégées · Confidentialité garantie','Your data is protected · Privacy guaranteed','Tus datos están protegidos · Privacidad garantizada','بياناتك محمية · الخصوصية مضمونة');
add('Les étoiles n’imposent rien,','The stars impose nothing,','Las estrellas no imponen nada,','النجوم لا تفرض شيئاً،');
add('elles éclairent vos choix.','they illuminate your choices.','iluminan tus decisiones.','بل تضيء اختياراتك.');
add('Mot de passe oublié ?','Forgot password?','¿Olvidaste tu contraseña?','هل نسيت كلمة المرور؟');

// Messages courants
add('Calcul astrologique en cours…','Astrological calculation in progress…','Cálculo astrológico en curso…','جارٍ الحساب الفلكي…');
add('Interprétation en cours…','Interpretation in progress…','Interpretación en curso…','جارٍ إعداد التفسير…');
add('Analyse en cours…','Analysis in progress…','Análisis en curso…','جارٍ التحليل…');
add('Erreur réseau. Le résultat calculé reste disponible.','Network error. The calculated result remains available.','Error de red. El resultado calculado sigue disponible.','خطأ في الشبكة. تبقى النتيجة المحسوبة متاحة.');
add('Connexion requise pour l’interprétation IA.','Sign-in required for AI interpretation.','Se requiere iniciar sesión para la interpretación IA.','يلزم تسجيل الدخول للحصول على التفسير بالذكاء الاصطناعي.');
add('Cette fonction nécessite un droit Premium actif.','This feature requires active Premium access.','Esta función requiere acceso Premium activo.','تتطلب هذه الميزة اشتراك Premium نشطاً.');

const MONTHS={
 fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
 en:['January','February','March','April','May','June','July','August','September','October','November','December'],
 es:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 ar:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
};
const SIGNS={
 fr:['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'],
 en:['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
 es:['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'],
 ar:['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت']
};
const PLANETS={
 'Soleil':{en:'Sun',es:'Sol',ar:'الشمس'},'Lune':{en:'Moon',es:'Luna',ar:'القمر'},'Mercure':{en:'Mercury',es:'Mercurio',ar:'عطارد'},'Vénus':{en:'Venus',es:'Venus',ar:'الزهرة'},'Venus':{en:'Venus',es:'Venus',ar:'الزهرة'},'Mars':{en:'Mars',es:'Marte',ar:'المريخ'},'Jupiter':{en:'Jupiter',es:'Júpiter',ar:'المشتري'},'Saturne':{en:'Saturn',es:'Saturno',ar:'زحل'},'Uranus':{en:'Uranus',es:'Urano',ar:'أورانوس'},'Neptune':{en:'Neptune',es:'Neptuno',ar:'نبتون'},'Pluton':{en:'Pluto',es:'Plutón',ar:'بلوتو'},'Noeud':{en:'Node',es:'Nodo',ar:'العقدة'}
};

let observer=null,queued=false,working=false,aiWrapped=null;
function lang(){const x=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return META[x]?x:'fr';}
function lookup(raw,l){const x=D[raw];return x?(x[l]||raw):null;}
function canonicalText(s){
  for(const fr of Object.keys(D)){
    const x=D[fr];if(s===fr||s===x.en||s===x.es||s===x.ar)return fr;
  }
  return null;
}
function replaceMonthsSigns(s,l){
  if(l==='fr')return s;
  let out=s;
  MONTHS.fr.forEach((m,i)=>{out=out.replace(new RegExp('\\b'+m+'\\b','gi'),MONTHS[l][i]);});
  SIGNS.fr.forEach((m,i)=>{out=out.replace(new RegExp('\\b'+m+'\\b','g'),SIGNS[l][i]);});
  Object.keys(PLANETS).forEach(fr=>{out=out.replace(new RegExp('\\b'+fr+'\\b','g'),PLANETS[fr][l]||fr);});
  return out;
}
function dynamic(s,l){
  let m=s.match(/^(\d+)\s+signals?\s+calcul[eé]s?$/i);
  if(m){const n=m[1];return l==='en'?`${n} calculated signal${n==='1'?'':'s'}`:l==='es'?`${n} señal${n==='1'?'':'es'} calculada${n==='1'?'':'s'}`:`${n} إشارة محسوبة`;}
  m=s.match(/^(\d+)\s+ans$/i);if(m)return l==='en'?`${m[1]} years old`:l==='es'?`${m[1]} años`:`${m[1]} سنة`;
  m=s.match(/^Maison\s+(\d+)$/i);if(m)return l==='en'?`House ${m[1]}`:l==='es'?`Casa ${m[1]}`:`البيت ${m[1]}`;
  return replaceMonthsSigns(s,l);
}
function shouldSkip(node){const p=node.parentElement;if(!p)return true;return !!p.closest('script,style,noscript,code,pre,textarea,.ap-report,.rapport-texte,.ev-card-desc,.ap-no-auto-translate');}
function translateNode(n,l){
  if(shouldSkip(n))return;
  const raw=n.nodeValue;if(!raw||!raw.trim())return;
  const t=raw.trim();const fr=canonicalText(t)||t;let out=lookup(fr,l);
  if(!out&&l!=='fr')out=dynamic(t,l);
  if(l==='fr'&&canonicalText(t))out=fr;
  if(out&&out!==t)n.nodeValue=raw.replace(t,out);
}
function translateAttrs(root,l){
  (root||document).querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(el=>{
    ['placeholder','title','aria-label'].forEach(a=>{
      const v=el.getAttribute(a);if(!v)return;const fr=canonicalText(v)||v;let out=lookup(fr,l);if(!out&&l!=='fr')out=dynamic(v,l);if(l==='fr'&&canonicalText(v))out=fr;if(out&&out!==v)el.setAttribute(a,out);
    });
  });
}
function fixRelationSelect(l){
  const sel=document.getElementById('ap-rel-type');if(!sel)return;
  const rows=[['couple','Amour','Love','Amor','الحب'],['famille','Famille','Family','Familia','العائلة'],['pro','Travail','Work','Trabajo','العمل'],['amitie','Amitié','Friendship','Amistad','الصداقة']];
  Array.from(sel.options).forEach((o,i)=>{const r=rows[i];if(!r)return;o.setAttribute('value',r[0]);o.textContent=l==='fr'?r[1]:l==='en'?r[2]:l==='es'?r[3]:r[4];});
}
function fixWeekdays(l){
  const map={fr:['L','M','M','J','V','S','D'],en:['M','T','W','T','F','S','S'],es:['L','M','X','J','V','S','D'],ar:['ن','ث','ر','خ','ج','س','ح']};
  document.querySelectorAll('.ap-cal-head').forEach((e,i)=>{if(map[l][i])e.textContent=map[l][i];});
}
function syncLegacy(l){
  try{if(typeof window.apSetLang==='function')window.apSetLang(l,false);else{window.AP_LANG=l;document.documentElement.lang=l;document.documentElement.dir=META[l].dir;}}catch(e){window.AP_LANG=l;}
  document.documentElement.lang=l;document.documentElement.dir=META[l].dir;document.body?.classList.toggle('ap-rtl',l==='ar');
  document.querySelectorAll('#ap-lang,#ap-profile-lang,.ap-lang-select').forEach(s=>{if(s.value!==l)s.value=l;});
}
function translateAll(){
  if(working)return;working=true;
  try{
    const l=lang();syncLegacy(l);
    const root=document.getElementById('ap-final-root')||document.body;
    if(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(n=>translateNode(n,l));translateAttrs(root,l);}
    fixRelationSelect(l);fixWeekdays(l);installAIWrapper();
  }finally{working=false;}
}
function schedule(){if(queued||working)return;queued=true;requestAnimationFrame(()=>{queued=false;translateAll();});}
function installAIWrapper(){
  const fn=window.appelerClaude;if(typeof fn!=='function'||fn.__apGlobalI18n)return;
  const wrapped=async function(args){
    const l=lang(),rule={fr:'Réponds intégralement en français.',en:'Answer entirely in English.',es:'Responde íntegramente en español.',ar:'أجب بالكامل باللغة العربية.'}[l];
    const next={...(args||{})};next.system=String(next.system||'')+'\n\n'+rule+' Do not switch language anywhere in the report, including headings, dates, advice and conclusions.';
    if(Array.isArray(next.messages))next.messages=next.messages.map(m=>{
      if(m&&m.role==='user'&&typeof m.content==='string'){
        try{const j=JSON.parse(m.content);if(j&&typeof j==='object'){j.language=l;return {...m,content:JSON.stringify(j)};}}catch(e){}
      }
      return m;
    });
    return fn.call(this,next);
  };
  wrapped.__apGlobalI18n=true;wrapped.__apGlobalI18nOriginal=fn;window.appelerClaude=wrapped;aiWrapped=wrapped;
}

function start(){
  translateAll();installAIWrapper();
  observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('change',ev=>{if(ev.target&&['ap-lang','ap-profile-lang'].includes(ev.target.id)){localStorage.setItem('astro-lang',ev.target.value);setTimeout(schedule,0);setTimeout(schedule,80);}},true);
  document.addEventListener('click',()=>setTimeout(schedule,0),true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
