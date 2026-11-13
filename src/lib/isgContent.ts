import { azTehlikeliCurriculum } from "./isgCurriculum";

export type ExamQuestion = {
  id: string;
  lessonId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

/** Draft formative questions, not a validated final exam or a certification basis. */
export const sampleQuestions: ExamQuestion[] = [
  { id: "q1", lessonId: "mevzuat", question: "Çalışan, ciddi ve yakın tehlike gördüğünde öncelikle ne yapmalıdır?", options: ["Tehlikeyi görmezden gelmeli", "Yetkili kişilere bildirmeli ve işyerinin güvenli prosedürünü izlemeli", "İşi hızlandırmalı", "Sosyal medyada paylaşmalı"], correctIndex: 1, explanation: "Tehlikeler yetkili kişilere bildirilmeli; işyerinin acil durum ve güvenli çalışma prosedürleri izlenmelidir." },
  { id: "q2", lessonId: "duzen", question: "Yaya geçiş yolundaki kablo için en uygun yaklaşım hangisidir?", options: ["Olduğu gibi bırakmak", "Üzerini kağıtla kapatmak", "Uygun kablo yönetimiyle takılma riskini gidermek", "Uyarı olmadan kullanmaya devam etmek"], correctIndex: 2, explanation: "Takılma ve düşme riskleri kaynağında giderilmelidir." },
  { id: "q3", lessonId: "kazalar", question: "İş kazası sonrasında hangisi doğrudur?", options: ["Olayı gizlemek", "Yalnızca söylentiyle yetinmek", "Kayıtları silmek", "Güvenliği sağlayıp olayı belirlenmiş kanallardan bildirmek"], correctIndex: 3, explanation: "Güvenliğin sağlanması, gerekli yardım ve doğru bildirim önemlidir." },
  { id: "q4", lessonId: "hastalik", question: "Meslek hastalıklarının önlenmesinde en etkili yaklaşım hangisidir?", options: ["Maruziyetleri değerlendirip kaynağında kontrol etmek", "Şikayetleri gizlemek", "Koruyucu önlemleri kaldırmak", "Yalnızca kişisel dayanıklılığa güvenmek"], correctIndex: 0, explanation: "Risk değerlendirmesi ve uygun kontrol önlemleri maruziyeti azaltır." },
  { id: "q5", lessonId: "ergonomi", question: "Ekranlı araçlarla çalışırken hangisi yararlıdır?", options: ["Sürekli uygunsuz duruş", "Ekranı göz hizasına uygun ayarlamak ve planlı molalar vermek", "Sandalyeyi kullanmamak", "Aydınlatmayı tamamen kapatmak"], correctIndex: 1, explanation: "Uygun çalışma düzeni ve dinlenme araları kas-iskelet zorlanmasını azaltabilir." },
  { id: "q6", lessonId: "ilk-yardim", question: "Acil durumda ilk doğru adım hangisidir?", options: ["Önce kendi ve çevrenin güvenliğini değerlendirmek ve uygun yardım çağırmak", "Kontrolsüz müdahale etmek", "Olay yerini kalabalıklaştırmak", "Yetkisiz ilaç vermek"], correctIndex: 0, explanation: "Olay yeri güvenliği ve profesyonel yardım çağrısı önceliklidir." },
  { id: "q7", lessonId: "yangin", question: "Yangın alarmı duyulduğunda hangisi doğrudur?", options: ["Asansöre yönelmek", "Kişisel eşyaları toplamak", "Belirlenmiş tahliye yolunu izlemek", "Alarmı kapatmak"], correctIndex: 2, explanation: "İşyerinin tahliye planı ve toplanma prosedürü izlenmelidir." },
  { id: "q8", lessonId: "riskler", question: "Kimyasal bir ürünle çalışmadan önce hangi bilgi kaynağı incelenmelidir?", options: ["Reklam görseli", "Güvenlik bilgi formu ve işyeri talimatı", "Ürünün rengi", "Sosyal medya yorumu"], correctIndex: 1, explanation: "Güvenlik bilgi formları ve talimatlar tehlikeleri ve önlemleri açıklar." },
  { id: "q9", lessonId: "ekipman", question: "Arızalı iş ekipmanı görüldüğünde ne yapılmalıdır?", options: ["Kullanmaya devam etmek", "Arızayı gizlemek", "Yetkisiz onarım yapmak", "Kullanımı durdurup yetkiliye bildirmek"], correctIndex: 3, explanation: "Arızalı ekipman güvenli prosedüre göre hizmet dışı bırakılmalıdır." }
];

export type VideoProductionBrief = {
  lessonId: string;
  durationMinutes: number;
  narrationPrompt: string;
  segmentMinutes: number[];
};

export const videoProductionBriefs: VideoProductionBrief[] = azTehlikeliCurriculum.map((lesson) => {
  const segmentMinutes: number[] = [];
  let remaining = lesson.minutes;
  while (remaining > 0) {
    const part = Math.min(10, remaining);
    segmentMinutes.push(part);
    remaining -= part;
  }
  return {
    lessonId: lesson.id,
    durationMinutes: lesson.minutes,
    segmentMinutes,
    narrationPrompt: [
      "Türkçe iş sağlığı ve güvenliği uzaktan eğitim videosu için özgün anlatım ve sahne planı üret.",
      "Hedef kitle: az tehlikeli işyerinde çalışan yetişkinler.",
      "Ders: " + lesson.title + ". Süre: " + lesson.minutes + " dakika.",
      "Öğrenme hedefleri: " + lesson.objectives.join("; ") + ".",
      "Her bölüm için dakika bazlı sahne, seslendirme metni, işyeri örneği, risk-önlem eşleştirmesi ve iki anlama kontrolü hazırla.",
      "Sadece doğrulanabilir mevzuat ve genel güvenlik ilkelerini kullan; mevzuat atıflarını uzman kontrolüne işaretle.",
      "İlk yardım uygulaması gibi uzmanlık gerektiren müdahalelerde yetkisiz uygulama talimatı verme.",
      "Görüntü, altyazı ve seslendirme metninin süreye uyduğunu gerçek render sonrası doğrula.",
      "Çıktıyı taslak olarak etiketle; mevzuat onayı olmadan resmi eğitim sayma."
    ].join("\n")
  };
});
