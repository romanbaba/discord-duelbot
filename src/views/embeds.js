// @ts-check
import { AdvancedEmbed, AdvancedEmbedType } from "utilscord";
import config from "../config.js";

/** @param {import("discord.js").CommandInteraction} interaction */
export const DeniedEmbed = (interaction) =>
	new AdvancedEmbed()
		// @ts-ignore
		.setInteraction(interaction)
		.setStyle(AdvancedEmbedType.Error, "Reddedildi")
		.setDescription("Karşı rakip nihahi savaşı reddetdi.");

/** @param {import("discord.js").CommandInteraction} interaction */
export const TimeIsOver = (interaction) =>
	new AdvancedEmbed()
		// @ts-ignore
		.setInteraction(interaction)
		.setStyle(AdvancedEmbedType.Error, "Zaman Aşımı")
		.setDescription("Karşı rakip nihahi savaşı zamanında kabul edemedi.");

/** @param {import("discord.js").CommandInteraction} interaction */
export const FirstAttackNoUsed = (interaction) =>
	new AdvancedEmbed()
		// @ts-ignore
		.setInteraction(interaction)
		.setStyle(AdvancedEmbedType.Error, "Maç iptal edildi.")
		.setDescription("İlk turdan eylem gerçekleşmediği için maç iptal edildi.");

export function DuelWaitEmbed(interaction) {
	return new AdvancedEmbed()
		.setInteraction(interaction)
		.setStyle(AdvancedEmbedType.Loading, "Bekleniyor...")
		.setDescription(
			"⏳ **Düello isteğini 15 saniye içinde kabul etmezsen, otomatik olarak reddedilecektir.** Acele et ve savaşa hazırlan! 🤺🕒",
		)
		.setFields({
			name: "Bilgilendirmeler",
			value: [
				"Eğer biriniz 2 kez elinizi oynamaz ise maç iptal edilir.",
				"Eğer ikinizde üst üste elinizi oynamaz ise maç iptal edilir.",
				"El başına 15 saniye süreniz bulunmaktadır.",
				"Yapacağınız her eylem kayıt altına alınmaktadır.",
				"İyi eğlenceler! 🥳🎉",
			]
				.map((rule, index) => `**${++index}.** » ${rule}`)
				.join("\n"),
		});
}

export function UnavailableEmbed(interaction) {
	return new AdvancedEmbed()
		.setInteraction(interaction)
		.setStyle(AdvancedEmbedType.Error)
		.setDescription(
			"Düello başlatmak için senin veya rakibinin bir oyunda olmaması gerekir.",
		);
}

export function StartEmbed(buttonInteraction, interaction, opponent) {
	const defaultBar = `Can: **${config.globalHP} ❤️**`;

	return new AdvancedEmbed()
		.setInteraction(buttonInteraction)
		.setStyle(AdvancedEmbedType.Default, "Maç Başladı")
		.setDescription(
			"Maç başladı; 15 saniye içinde atağınızı veya savunmanızı gerçekleştirmezseniz, el karşı tarafa geçer. Eğer her iki taraf da üst üste aynı durumu gerçekleştirirse, maç iptal edilir.",
		)
		.setFields(
			{
				name: `${interaction.user.displayName}:`,
				value: defaultBar,
				inline: true,
			},
			{
				name: `${opponent.displayName}:`,
				value: defaultBar,
				inline: true,
			},
		);
}
