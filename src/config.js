// @ts-check

export default {
	token:
		"",
	superLogs: false,
	channelId: "",
	globalHP: 500,
	globalPoisonMaxDuration: 1,
	messages: {
		thumpIgnore:
			"🔊 **Harika bir hamle olacaktı ama... Başarısız!** Şimdi sıra <@{0}>'da! 💥",
		/**
		 *
		 * @param {number} power
		 */
		thump(power) {
			return `🔊 ** %${power} güç ile saldırdın. ${
				power <= 20
					? "Etkisiz bir vuruş, daha fazla çaba göstermelisin!"
					: power > 20 && power < 80
					? "İyi bir hamle, devam et!"
					: "Muazzam bir vuruş, rakibini zor durumda bıraktın!"
			}** Şimdi <@{0}>'nin karşılık vereceği taktiği merakla bekleyelim! 💪🔥`;
		},
		ultraIgnore:
			"🔊 **Huh! Sanırım bu tuş biraz bozuk. Yine de harika bir çaba!** Şimdi <@{0}>'nin hamle sırası! 🎮😄",
		/**
		 *
		 * @param {boolean} onDefense
		 */
		ultra(onDefense) {
			return `**${
				onDefense
					? "🛡️ Kalkanın güçlü, ancak nihai güç biraz zayıfladı!"
					: "💥 BOOM! Evren, II. Dünya Savaşı'ndan bile daha heyecanlı hale geldi!"
			}** Şimdi sıradaki hamleyi <@{0}> yapıyor. 🚀🔥`;
		},
		/**
		 *
		 * @param {number} power
		 */
		poison(power) {
			return `🔊 **%${power} gücünde zehir mi? 🤢** Umarım bu zehirden kurtulabilirsin! Şimdi <@{0}> sıradaki hamleyi yapıyor. 🌪️🔮`;
		},
		swapIgnore:
			"🔊 **Can değiştirme duan işe yaramadı! 🙏** Şimdi <@{0}> sıradaki hamleyi yapacak. 💥",
		swap: "🔊 **Müthiş! Can değiştirme duası kabul edildi! 🌟** Şimdi <@{0}> sıradaki hamlesini yapacak. 💥",
		shield:
			"🔊 **Muazzam! Nihai güçleri bloke eden bir kalkan kullanıyorsun! 🛡️** Şimdi <@{0}>'nin sıradaki hamlesini bekleyelim. 💫🔥",
		/**
		 *
		 * @param {number} power
		 */
		boost(power) {
			return `🔊 **${power} adet yemek mi o? Harika bir tercih!** Şimdi <@{0}>'nin sıradaki hamlesini izleyelim. 🍔🔥`;
		},
		win: "👑👑 NİHAHİ SAVAŞ BİTTİ, EVRENİN SAHİBİ ARTIK <@{0}> OLDU. 👑👑",
		esc: "🤣🤣 PHUAHUAHUA <@{0}> KAÇTI!! 🤣🤣",
		timeout:
			"🔊 **Nihai savaş sırasında AFK kalmak mı? Güzel.** Şimdi de <@{0}>'nin sıradaki hamlesini izleyelim. 🍔🔥",
		areYouSureAboutRunningAwayRow:
			"🧐 **Hey <@{0}>, cidden bir korkak gibi kaçıyor musun?**",
		cancel: "🔉 **Kimsecikler yok mu?** O zaman maç iptal.",
		shieldIgnore:
			"🔉 **Beceriksiz!** Kalkanı tutana kadar süren geçti. Şimdi de <@{0}>'nin sıradaki hamlesini izleyelim. 🍔🔥",
		poisonIgnore:
			"🔉 **Oraya değil!** Zehir patlayıcısını yanlış yere fırlattın. Şimdi de <@{0}>'nin sıradaki hamlesini izleyelim. 💫🔥",
		healthIgnore:
			"🔉 **Sanırım evren bu eylemi yapmana izin vermiyor.** Şimdi <@{0}> sıradaki hamleyi yapıyor. 🌪️🔮",
	},
	hit: {
		min: 1,
		max: 100,
	},
	ultrapower: {
		min: 100,
		max: 300,
	},
	health: {
		min: 1,
		max: 100,
	},
	possibility: {
		ultrapower: 0.2,
		swap: 0.02,
		shield: 0.5,
		health: 0.75,
		poison: 0.5,
	},
};
