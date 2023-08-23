const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  TvlLatestRepository,
  BorrowedLatestRepository,
} from '../../database/repositories'

import {
  ITvlTotal,
  IBorrowedTotal,
} from '../../interfaces';

import {
  NETWORKS,
  DEPLOYMENT_CONFIGS,
} from '../../constants';

import { formatDecimal } from '../../utils';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tvl')
    .setDescription('Fetches the latest "TVL", "Borrowed" & "TVL + Borrowed" for silo.finance'),
	async execute(interaction: any) {
    let buildResponse = [];
    // let networkToLatestTvlFigures : {[key: string]: ITvlTotal} = {};
    // let networkToLatestBorrowedFigures : {[key: string]: IBorrowedTotal} = {};
    let subsequentFlag = false;
    let totalTvlAndBorrowed = new BigNumber(0);
    let totalTvl = new BigNumber(0);
    let totalBorrowed = new BigNumber(0);
    let [latestNetworkResultsTvl, latestNetworkResultsBorrowed] = await Promise.all([
      Promise.all(DEPLOYMENT_CONFIGS.map(deploymentConfig => TvlLatestRepository.getLatestResultByNetworkAndMetaAndDeploymentID(deploymentConfig.network, "all", deploymentConfig.id))),
      Promise.all(DEPLOYMENT_CONFIGS.map(deploymentConfig => BorrowedLatestRepository.getLatestResultByNetworkAndMetaAndDeploymentID(deploymentConfig.network, "all", deploymentConfig.id)))
    ])
    let deploymentConfigIndex = 0;
    for(let deploymentConfig of DEPLOYMENT_CONFIGS) {
      let network = deploymentConfig.network;
      // networkToLatestTvlFigures[network] = latestNetworkResultsTvl[deploymentConfigIndex];
      // networkToLatestBorrowedFigures[network] = latestNetworkResultsBorrowed[deploymentConfigIndex];
      let tvlPlusBorrowed = new BigNumber(latestNetworkResultsTvl[deploymentConfigIndex]?.tvl).plus(latestNetworkResultsBorrowed[deploymentConfigIndex]?.borrowed).toNumber();
      totalTvlAndBorrowed = totalTvlAndBorrowed.plus(tvlPlusBorrowed);
      totalTvl = totalTvl.plus(latestNetworkResultsTvl[deploymentConfigIndex]?.tvl);
      totalBorrowed = totalBorrowed.plus(latestNetworkResultsBorrowed[deploymentConfigIndex]?.borrowed);
      buildResponse.push({ name: '\u200B', value: '\u200B' });
      buildResponse.push({ name: `TVL + Borrowed (${deploymentConfig.idHumanReadable})`, value: `*$ ${formatDecimal(tvlPlusBorrowed, 2)}*` });
      buildResponse.push({ name: `TVL (${deploymentConfig.idHumanReadable})`, value: `*$ ${formatDecimal(latestNetworkResultsTvl[deploymentConfigIndex]?.tvl, 2)}*` });
      buildResponse.push({ name: `Borrowed (${deploymentConfig.idHumanReadable})`, value: `*$ ${formatDecimal(latestNetworkResultsBorrowed[deploymentConfigIndex]?.borrowed, 2)}*` });
      subsequentFlag = true;
      deploymentConfigIndex++;
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