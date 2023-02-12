const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  TvlMinutelyRepository,
  BorrowedMinutelyRepository,
} from '../../database/repositories'

import {
  ITvlTotal,
  IBorrowedTotal,
} from '../../interfaces';

import {
  NETWORKS,
} from '../../constants';

import { formatDecimal } from '../../utils';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tvl')
    .setDescription('Fetches the latest "TVL", "Borrowed" & "TVL + Borrowed" for silo.finance'),
	async execute(interaction: any) {
    let buildResponse = [];
    let networkToLatestTvlFigures : {[key: string]: ITvlTotal} = {};
    let networkToLatestBorrowedFigures : {[key: string]: IBorrowedTotal} = {};
    let subsequentFlag = false;
    let totalTvlAndBorrowed = new BigNumber(0);
    let totalTvl = new BigNumber(0);
    let totalBorrowed = new BigNumber(0);
    for(let network of NETWORKS) {
      let latestNetworkResultTvl = await TvlMinutelyRepository.getLatestResultByNetworkAndMeta(network, "all");
      let latestNetworkResultBorrowed = await BorrowedMinutelyRepository.getLatestResultByNetworkAndMeta(network, "all");
      networkToLatestTvlFigures[network] = latestNetworkResultTvl;
      networkToLatestBorrowedFigures[network] = latestNetworkResultBorrowed;
      let tvlPlusBorrowed = new BigNumber(latestNetworkResultTvl?.tvl).plus(latestNetworkResultBorrowed?.borrowed).toNumber();
      totalTvlAndBorrowed = totalTvlAndBorrowed.plus(tvlPlusBorrowed);
      totalTvl = totalTvl.plus(latestNetworkResultTvl?.tvl);
      totalBorrowed = totalBorrowed.plus(latestNetworkResultBorrowed?.borrowed);
      buildResponse.push({ name: '\u200B', value: '\u200B' });
      buildResponse.push({ name: `TVL + Borrowed (${network[0].toUpperCase()}${network.slice(1).toLowerCase()})`, value: `*$ ${formatDecimal(tvlPlusBorrowed, 2)}*` });
      buildResponse.push({ name: `TVL (${network[0].toUpperCase()}${network.slice(1).toLowerCase()})`, value: `*$ ${formatDecimal(latestNetworkResultTvl?.tvl, 2)}*` });
      buildResponse.push({ name: `Borrowed (${network[0].toUpperCase()}${network.slice(1).toLowerCase()})`, value: `*$ ${formatDecimal(latestNetworkResultBorrowed?.borrowed, 2)}*` });
      subsequentFlag = true;
    }
    buildResponse.unshift({ name: `Borrowed (All)`, value: `*$ ${formatDecimal(totalBorrowed.toNumber(), 2)}*` });
    buildResponse.unshift({ name: `TVL (All)`, value: `*$ ${formatDecimal(totalTvl.toNumber(), 2)}*` });
    buildResponse.unshift({ name: `TVL + Borrowed (All)`, value: `*$ ${formatDecimal(totalTvlAndBorrowed.toNumber(), 2)}*` });
    let embed = await new EmbedBuilder()
      .setAuthor({ name: `TVL Overview for Silo Network`, iconURL: 'https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png' })
      .addFields(
        ...buildResponse
      )
      .setFooter({ text: `Source: silo.observer`, iconURL: 'https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png' })
    await interaction.reply({embeds: [embed]});
	},
};