/**
 * Multilingual Voice Prompts Dictionary
 * English, Hindi, Marathi, Tamil, Telugu, Kannada
 */

export interface VoicePromptSet {
  welcome: string;
  selectLanguage: string;
  aiIntro1: string;
  aiIntro2: string;
  askName: string;
  askAge: string;
  askLocation: string;
  askOccupation: string;
  askIncome: string;
  askCategory: string;
  profileComplete: string;
  homeGreeting: (name: string) => string;
  listeningPrompt: string;
  thinkingPrompt: string;
  schemeDiscovery: (count: number) => string;
  eligibilityResult: string;
  explainResult: string;
  documentsPrompt: string;
  documentVerified: string;
}

export const VOICE_PROMPTS: Record<string, VoicePromptSet> = {
  English: {
    welcome: "Government help, made simple. Welcome to Sahayak AI.",
    selectLanguage: "How would you like to talk to me?",
    aiIntro1: "I'm your AI Officer. I can help you discover government schemes.",
    aiIntro2: "Before we begin, I'd like to know a little about you.",
    askName: "What's your name?",
    askAge: "How old are you?",
    askLocation: "Where do you live? Please select your state and city.",
    askOccupation: "What do you currently do?",
    askIncome: "What is your annual family income?",
    askCategory: "Which category applies to you?",
    profileComplete: "I've got it. I now understand your basic profile.",
    homeGreeting: (name: string) => `Hello ${name}. What can I help you with today?`,
    listeningPrompt: "Listening... Tell me what you need help with.",
    thinkingPrompt: "Evaluating rules and matching government schemes for you.",
    schemeDiscovery: (count: number) => `I found ${count} potential scheme matches for you. Based on your profile, I have prioritized the best options.`,
    eligibilityResult: "You appear eligible based on your profile details.",
    explainResult: "Here is why you qualify based on official government rules.",
    documentsPrompt: "You will need these verified documents to apply.",
    documentVerified: "Document verified successfully.",
  },
  Hindi: {
    welcome: "सरकारी मदद, अब हुई आसान। सहायक एआई में आपका स्वागत है।",
    selectLanguage: "आप मुझसे किस भाषा में बात करना चाहते हैं?",
    aiIntro1: "मैं आपकी एआई ऑफिसर हूँ। मैं आपको सरकारी योजनाएँ खोजने में मदद कर सकती हूँ।",
    aiIntro2: "शुरू करने से पहले, मैं आपके बारे में थोड़ा जानना चाहती हूँ।",
    askName: "आपका नाम क्या है?",
    askAge: "आपकी उम्र कितनी है?",
    askLocation: "आप किस राज्य और शहर में रहते हैं?",
    askOccupation: "आप वर्तमान में क्या काम करते हैं?",
    askIncome: "आपकी वार्षिक पारिवारिक आय कितनी है?",
    askCategory: "आपकी वर्ग श्रेणी कौन सी है?",
    profileComplete: "मुझे समझ आ गया। मैं आपकी बुनियादी जानकारी समझ गई हूँ।",
    homeGreeting: (name: string) => `नमस्ते ${name}। आज मैं आपकी क्या मदद कर सकती हूँ?`,
    listeningPrompt: "सुन रही हूँ... बताइए आपको किस योजना में मदद चाहिए?",
    thinkingPrompt: "नियमों की जाँच की जा रही है और योजनाएँ खोजी जा रही हैं।",
    schemeDiscovery: (count: number) => `मुझे आपके लिए ${count} उपयुक्त योजनाएँ मिली हैं।`,
    eligibilityResult: "आप इस योजना के लिए पात्र प्रतीत होते हैं।",
    explainResult: "सरकारी नियमों के अनुसार आप क्यों पात्र हैं, यहाँ देखें।",
    documentsPrompt: "आवेदन करने के लिए आपको इन दस्तावेजों की आवश्यकता होगी।",
    documentVerified: "दस्तावेज़ सफलतापूर्वक सत्यापित हो गया है।",
  },
  Marathi: {
    welcome: "शासकीय मदत, आता सोपी झाली. सहाय्यक एआय मध्ये आपले स्वागत आहे.",
    selectLanguage: "आपण माझ्याशी कोणत्या भाषेत बोलू इच्छिता?",
    aiIntro1: "मी तुमची एआय ऑफिसर आहे. मी तुम्हाला शासकीय योजना शोधण्यात मदत करू शकते.",
    aiIntro2: "सुरवात करण्यापूर्वी, मला तुमच्याबद्दल थोडे जाणून घ्यायचे आहे.",
    askName: "तुमचे नाव काय आहे?",
    askAge: "तुमचे वय किती आहे?",
    askLocation: "आपण कोणत्या राज्यात आणि शहरात राहता?",
    askOccupation: "आपण सध्या काय करता?",
    askIncome: "तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?",
    askCategory: "तुमचा प्रवर्ग कोणता आहे?",
    profileComplete: "मला समजले. मला तुमची माहिती मिळाली आहे.",
    homeGreeting: (name: string) => `नमस्कार ${name}. आज मी तुम्हाला कशी मदत करू शकते?`,
    listeningPrompt: "ऐकत आहे... तुम्हाला कोणत्या योजनेबद्दल माहिती हवी आहे?",
    thinkingPrompt: "शासकीय नियमांची तपासणी केली जात आहे.",
    schemeDiscovery: (count: number) => `मला तुमच्यासाठी ${count} योग्य योजना मिळाल्या आहेत.`,
    eligibilityResult: "तुमच्या माहितीनुसार आपण या योजनेसाठी पात्र आहात.",
    explainResult: "शासकीय नियमांनुसार आपण का पात्र आहात ते येथे पहा.",
    documentsPrompt: "अर्ज करण्यासाठी तुम्हाला या कागदपत्रांची गरज पडेल.",
    documentVerified: "कागदपत्र यशस्वीरित्या पडताळले गेले आहे.",
  },
  Tamil: {
    welcome: "அரசு உதவி, இப்போது எளிது. உதவி ஏஐ-க்கு வரவேற்கிறோம்.",
    selectLanguage: "என்னிடம் எந்த மொழியில் பேச விரும்புகிறீர்கள்?",
    aiIntro1: "நான் உங்கள் ஏஐ அதிகாரி. அரசு திட்டங்களை கண்டறிய உதவுகிறேன்.",
    aiIntro2: "தொடங்குவதற்கு முன், உங்களைப் பற்றி தெரிந்து கொள்ள விரும்புகிறேன்.",
    askName: "உங்கள் பெயர் என்ன?",
    askAge: "உங்கள் வயது என்ன?",
    askLocation: "நீங்கள் எந்த மாநிலத்தில் வாழ்கிறீர்கள்?",
    askOccupation: "நீங்கள் தற்போது என்ன வேலை செய்கிறீர்கள்?",
    askIncome: "உங்கள் குடும்ப ஆண்டு வருமானம் எவ்வளவு?",
    askCategory: "உங்கள் பிரிவு எது?",
    profileComplete: "புரிந்தது. உங்கள் சுயவிவரத்தை புரிந்து கொண்டேன்.",
    homeGreeting: (name: string) => `வணக்கம் ${name}. இன்று உங்களுக்கு எவ்வாறு உதவட்டும்?`,
    listeningPrompt: "கேட்கிறேன்... உங்களுக்கு என்ன உதவி வேண்டும்?",
    thinkingPrompt: "திட்ட விதிகளை பரிசீலிக்கிறேன்.",
    schemeDiscovery: (count: number) => `உங்களுக்காக ${count} தகுதியான திட்டங்கள் கண்டறியப்பட்டுள்ளன.`,
    eligibilityResult: "நீங்கள் இந்த திட்டத்திற்கு தகுதியானவர்.",
    explainResult: "அரசு விதிகளின்படி நீங்கள் ஏன் தகுதியானவர் என்பது இதோ.",
    documentsPrompt: "விண்ணப்பிக்க இந்த ஆவணங்கள் தேவைப்படும்.",
    documentVerified: "ஆவணம் சரிபார்க்கப்பட்டது.",
  },
  Telugu: {
    welcome: "ప్రభుత్వ సాయం, ఇప్పుడు సులభం. సహాయక్ ఏఐ కి స్వాగతం.",
    selectLanguage: "మీరు నాతో ఏ భాషలో మాట్లాడాలనుకుంటున్నారు?",
    aiIntro1: "నేను మీ ఏఐ ఆఫీసర్ ను. ప్రభుత్వ పథకాలను వెతకడంలో సహాయపడతాను.",
    aiIntro2: "ప్రారంభించే ముందు, మీ గురించి కొంచెం తెలుసుకోవాలనుకుంటున్నాను.",
    askName: "మీ పేరు ఏమిటి?",
    askAge: "మీ వయస్సు ఎంత?",
    askLocation: "మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?",
    askOccupation: "మీరు ప్రస్తుతం ఏమి చేస్తున్నారు?",
    askIncome: "మీ వార్షిక కుటుంబ ఆదాయం ఎంత?",
    askCategory: "మీ కేటగిరీ ఏమిటి?",
    profileComplete: "నాకు అర్థమైంది. మీ ప్రొఫైల్ వివరాలు వచ్చాయి.",
    homeGreeting: (name: string) => `నమస్కారం ${name}. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?`,
    listeningPrompt: "వింటున్నాను... మీకు ఏ సహాయం కావాలి?",
    thinkingPrompt: "పథకం నిబంధనలను పరిశీలిస్తున్నాను.",
    schemeDiscovery: (count: number) => `మీ కోసం ${count} తగిన పథకాలు లభించాయి.`,
    eligibilityResult: "మీరు ఈ పథకానికి అర్హులుగా ఉన్నారు.",
    explainResult: "ప్రభుత్వ నిబంధనల ప్రకారం మీరు ఎందుకు అర్హులో ఇక్కడ చూడండి.",
    documentsPrompt: "దరఖాస్తు చేసుకోవడానికి ఈ ధృవీకరణ పత్రాలు అవసరం.",
    documentVerified: "పత్రం విజయవంతంగా ధృవీకరించబడింది.",
  },
  Kannada: {
    welcome: "ಸರ್ಕಾರಿ ನೆರವು, ಈಗ ಸುಲಭ. ಸಹಾಯಕ್ ಎಐ ಗೆ ಸ್ವಾಗತ.",
    selectLanguage: "ನೀವು ನನ್ನೊಂದಿಗೆ ಯಾವ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಲು ಬಯಸುತ್ತೀರಿ?",
    aiIntro1: "ನಾನು ನಿಮ್ಮ ಎಐ ಅಧಿಕಾರಿ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನೆರವಾಗುತ್ತೇನೆ.",
    aiIntro2: "ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು, ನಿಮ್ಮ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ತಿಳಿಯಲು ಬಯಸುತ್ತೇನೆ.",
    askName: "ನಿಮ್ಮ ಹೆಸರೇನು?",
    askAge: "ನಿಮ್ಮ ವಯಸ್ಸೆಷ್ಟು?",
    askLocation: "ನೀವು ಯಾವ ರಾಜ್ಯದಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?",
    askOccupation: "ನೀವು ಪ್ರಸ್ತುತ ಏನು ಮಾಡುತ್ತಿದ್ದೀರಿ?",
    askIncome: "ನಿಮ್ಮ ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯವೆಷ್ಟು?",
    askCategory: "ನಿಮ್ಮ ವರ್ಗ ಯಾವುದು?",
    profileComplete: "ನನಗೆ ಅರ್ಥವಾಯಿತು. ನಿಮ್ಮ ವಿವರಗಳು ಲಭ್ಯವಾಗಿವೆ.",
    homeGreeting: (name: string) => `ನಮಸ್ಕಾರ ${name}. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`,
    listeningPrompt: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?",
    thinkingPrompt: "ಯೋಜನೆ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.",
    schemeDiscovery: (count: number) => `ನಿಮಗಾಗಿ ${count} ಸೂಕ್ತ ಯೋಜನೆಗಳು ಸಿಕ್ಕಿವೆ.`,
    eligibilityResult: "ನೀವು ಈ ಯೋಜನೆಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.",
    explainResult: "ಸರ್ಕಾರಿ ನಿಯಮಗಳ ಪ್ರಕಾರ ನೀವು ಏಕೆ ಅರ್ಹರು ಎಂಬುದು ಇಲ್ಲಿದೆ.",
    documentsPrompt: "ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಈ ದಾಖಲೆಗಳು ಅಗತ್ಯವಿವೆ.",
    documentVerified: "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದೆ.",
  },
};

export function getPromptSet(language: string): VoicePromptSet {
  if (!language) return VOICE_PROMPTS['English'];

  const normMap: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    english: 'English',
    hindi: 'Hindi',
    marathi: 'Marathi',
    tamil: 'Tamil',
    telugu: 'Telugu',
    kannada: 'Kannada',
  };

  const matchedKey = normMap[language] || normMap[language.toLowerCase()] || language;
  return VOICE_PROMPTS[matchedKey] || VOICE_PROMPTS['English'];
}
