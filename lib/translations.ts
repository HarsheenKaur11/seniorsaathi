import { Language } from "./storage";

export interface UIStrings {
  appName: string;
  tagline: string;
  askPlaceholder: string;
  askSaathiCardTitle: string;
  askSaathiCardDesc: string;
  simplifyCardTitle: string;
  simplifyCardDesc: string;
  safetyCardTitle: string;
  safetyCardDesc: string;
  guideCardTitle: string;
  guideCardDesc: string;
  remindersCardTitle: string;
  remindersCardDesc: string;
  todayWithSaathi: string;
  accessibilitySettings: string;
  textSize: string;
  contrast: string;
  simplifiedMode: string;
  autoReadAloud: string;
  language: string;
  forgetPreferences: string;
  readAloud: string;
  stopRead: string;
  speakNow: string;
  listening: string;
  done: string;
  back: string;
  needHelp: string;
  completedTitle: string;
  guideStepByStep: string;
  checkSuspicious: string;
}

export const TRANSLATIONS: Record<Language, UIStrings> = {
  English: {
    appName: "SeniorSaathi",
    tagline: "Digital life, made simple.",
    askPlaceholder: "Ask anything about your digital life...",
    askSaathiCardTitle: "ASK SAATHI",
    askSaathiCardDesc: "Ask anything about your phone, apps, or messages.",
    simplifyCardTitle: "SIMPLIFY",
    simplifyCardDesc: "Make confusing messages, bills, or notices easy to understand.",
    safetyCardTitle: "SAFETY CHECK",
    safetyCardDesc: "Check if a message, link, or request looks like a scam.",
    guideCardTitle: "GUIDE ME",
    guideCardDesc: "Get calm, step-by-step help with your digital tasks.",
    remindersCardTitle: "REMINDERS",
    remindersCardDesc: "Keep track of bills, doctor appointments, and calls.",
    todayWithSaathi: "Today with Saathi",
    accessibilitySettings: "Accessibility Settings",
    textSize: "Text Size",
    contrast: "Contrast",
    simplifiedMode: "Simplified View",
    autoReadAloud: "Auto Read-Aloud",
    language: "Language",
    forgetPreferences: "Forget Saved Preferences",
    readAloud: "Read Aloud",
    stopRead: "Stop Reading",
    speakNow: "Press microphone and speak",
    listening: "Listening carefully...",
    done: "Done",
    back: "Back",
    needHelp: "I need help with this step",
    completedTitle: "You did it 🎉",
    guideStepByStep: "Guide me step-by-step",
    checkSuspicious: "Check if this looks suspicious",
  },
  Hindi: {
    appName: "सीनियरसाथी (SeniorSaathi)",
    tagline: "डिजिटल जीवन, आसान और सरल।",
    askPlaceholder: "अपने डिजिटल जीवन के बारे में कुछ भी पूछें...",
    askSaathiCardTitle: "साथी से पूछें",
    askSaathiCardDesc: "अपने फोन, ऐप्स या मैसेज के बारे में सवाल पूछें।",
    simplifyCardTitle: "सरल बनाएं",
    simplifyCardDesc: "कठिन मैसेज, बिल या नोटिस को आसानी से समझें।",
    safetyCardTitle: "सुरक्षा जांच",
    safetyCardDesc: "जांचें कि क्या कोई मैसेज या लिंक धोखाधड़ी (स्कैम) है।",
    guideCardTitle: "मार्गदर्शन करें",
    guideCardDesc: "एक-एक करके आसान चरणों में सहायता प्राप्त करें।",
    remindersCardTitle: "याद दिलाएं (रिमाइंडर)",
    remindersCardDesc: "दवाइयों, बिल और डॉक्टर की तारीख याद रखें।",
    todayWithSaathi: "आज साथी के साथ",
    accessibilitySettings: "पहुंच क्षमता (एक्सेसिबिलिटी) सेटिंग्स",
    textSize: "अक्षर का आकार (Text Size)",
    contrast: "रंग स्पष्टता (Contrast)",
    simplifiedMode: "सरल दृश्य (Simplified View)",
    autoReadAloud: "स्वचालित बोलकर सुनाएं",
    language: "भाषा (Language)",
    forgetPreferences: "मेरी सेटिंग्स हटाएं",
    readAloud: "बोलकर सुनाएं",
    stopRead: "पढ़ना बंद करें",
    speakNow: "माइक दबाएं और बोलें",
    listening: "ध्यान से सुन रहे हैं...",
    done: "हो गया (Done)",
    back: "पीछे जाएं (Back)",
    needHelp: "मुझे इस चरण में मदद चाहिए",
    completedTitle: "आपने यह कर दिखाया 🎉",
    guideStepByStep: "कदम दर कदम मार्गदर्शन करें",
    checkSuspicious: "जांचें कि क्या यह संदिग्ध है",
  },
  Punjabi: {
    appName: "ਸੀਨੀਅਰਸਾਥੀ (SeniorSaathi)",
    tagline: "ਡਿਜੀਟਲ ਜੀਵਨ, ਸਰਲ ਅਤੇ ਆਸਾਨ।",
    askPlaceholder: "ਆਪਣੇ ਡਿਜੀਟਲ ਜੀਵਨ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
    askSaathiCardTitle: "ਸਾਥੀ ਤੋਂ ਪੁੱਛੋ",
    askSaathiCardDesc: "ਫੋਨ, ਐਪਸ ਜਾਂ ਮੈਸੇਜਾਂ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛੋ।",
    simplifyCardTitle: "ਸਰਲ ਬਣਾਓ",
    simplifyCardDesc: "ਔਖੇ ਮੈਸੇਜਾਂ ਜਾਂ ਬਿਲਾਂ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਸਮਝੋ।",
    safetyCardTitle: "ਸੁਰੱਖਿਆ ਜਾਂਚ",
    safetyCardDesc: "ਜਾਂਚ ਕਰੋ ਕਿ ਮੈਸੇਜ ਜਾਂ ਲਿੰਕ ਧੋਖਾਧੜੀ ਤਾਂ ਨਹੀਂ।",
    guideCardTitle: "ਮਾਰਗਦਰਸ਼ਨ ਕਰੋ",
    guideCardDesc: "ਕਦਮ-ਦਰ-ਕਦਮ ਆਸਾਨ ਮਦਦ ਪ੍ਰਾਪਤ ਕਰੋ।",
    remindersCardTitle: "ਯਾਦਦੁਹਾਨੀ (Reminders)",
    remindersCardDesc: "ਬਿਲ ਅਤੇ ਡਾਕਟਰ ਦੀਆਂ ਮੁਲਾਕਾਤਾਂ ਯਾਦ ਰੱਖੋ।",
    todayWithSaathi: "ਅੱਜ ਸਾਥੀ ਨਾਲ",
    accessibilitySettings: "ਪਹੁੰਚਯੋਗਤਾ ਸੈਟਿੰਗਾਂ",
    textSize: "ਅੱਖਰਾਂ ਦਾ ਆਕਾਰ",
    contrast: "ਕੰਟ੍ਰਾਸਟ (Contrast)",
    simplifiedMode: "ਸਰਲ ਦ੍ਰਿਸ਼ (Simplified View)",
    autoReadAloud: "ਆਟੋ ਬੋਲ ਕੇ ਸੁਣਾਓ",
    language: "ਭਾਸ਼ਾ (Language)",
    forgetPreferences: "ਮੇਰੀਆਂ ਸੈਟਿੰਗਾਂ ਹਟਾਓ",
    readAloud: "ਬੋਲ ਕੇ ਸੁਣਾਓ",
    stopRead: "ਪੜ੍ਹਨਾ ਬੰਦ ਕਰੋ",
    speakNow: "ਮਾਈਕ ਦਬਾਓ ਅਤੇ ਬੋਲੋ",
    listening: "ਧਿਆਨ ਨਾਲ ਸੁਣ ਰਹੇ ਹਾਂ...",
    done: "ਹੋ ਗਿਆ (Done)",
    back: "ਪਿੱਛੇ (Back)",
    needHelp: "ਮੈਨੂੰ ਇਸ ਕਦਮ 'ਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ",
    completedTitle: "ਤੁਸੀਂ ਕਰ ਦਿਖਾਇਆ 🎉",
    guideStepByStep: "ਕਦਮ ਦਰ ਕਦਮ ਮਾਰਗਦਰਸ਼ਨ",
    checkSuspicious: "ਜਾਂਚੋ ਕਿ ਕੀ ਇਹ ਸ਼ੱਕੀ ਹੈ",
  },
};
