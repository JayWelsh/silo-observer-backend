const { request, gql } = require('graphql-request');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

import { SUBGRAPH_ENDPOINT, SUBGRAPH_VERSION } from '../../constants';
import { formatPercentage } from '../../utils';

const rateQuery = gql`
  query rateQuery($inputTokenSymbol: String!) {
    markets(where: { name: $inputTokenSymbol }) {
      id
      name
      rates {
        rate
        side
        type
        token {
          symbol
        }
      }
    }
  }
`;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rates')
		.addStringOption((option: any) =>
			option
				.setName('silo')
				.setDescription('The input token symbol for the silo you would like to query (e.g. CVX)')
        .setRequired(true)
    )
    .setDescription('Fetches the rates of the input token and bridge assets inside a silo'),
	async execute(interaction: any) {
    let silo = interaction.options.getString('silo');
    let result = await request(SUBGRAPH_ENDPOINT, rateQuery, {
      inputTokenSymbol: silo,
    });
    let sortOrder = ["WETH", "XAI"].indexOf(silo) === -1 ? [silo, "WETH", "XAI"] : [silo, silo === "XAI" ? "WETH" : "XAI"];
    let sortedRates = result?.markets?.[0]?.rates.sort((a: any, b: any) => sortOrder.indexOf(a.token.symbol) - sortOrder.indexOf(b.token.symbol));
    let buildRateResult = [];
    let entryCount = 0;
    buildRateResult.push({ name: '\u200B', value: '\u200B' });
    for(let rate of sortedRates) {
      let tokenSymbol = rate?.token?.symbol;
      buildRateResult.push({ name: `${tokenSymbol} (${rate.side})`, value: `*${formatPercentage(rate?.rate)} APY*` });
      entryCount++;
      if((entryCount % 2) === 0) {
        buildRateResult.push({ name: '\u200B', value: '\u200B' });
      }
    }
    let embed = await new EmbedBuilder()
      .setAuthor({ name: `Rates for ${silo} silo`, iconURL: `https://app.silo.finance/images/logos/${silo}.png` })
      .addFields(
        ...buildRateResult
      )
      .setFooter({ text: `Source: Silo Subgraph (v${SUBGRAPH_VERSION})`, iconURL: 'https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png' })
    await interaction.reply({embeds: [embed]});
	},
};