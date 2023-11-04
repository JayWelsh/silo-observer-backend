import BigNumber from 'bignumber.js';

import { utils } from 'ethers';

import {
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  AssetRepository,
} from '../../database/repositories';

import {
  fetchCoinGeckoAssetPriceClosestToTargetTime,
} from '../../utils';

import {
  getEventFingerprint,
} from '../../web3/utils'

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const backfillEventUsdValues = async () => {
  let startDate = Math.floor(new Date("2023-10-01 00:00").getTime() / 1000);

  console.log({startDate})

  let borrowEventsToFill = await BorrowEventRepository.getBorrowEventsSinceDateWithNullUsdValue(startDate);
  let borrowEventsWithZeroUsdValue = await BorrowEventRepository.getBorrowEventsSinceDateWithZeroUsdValue(startDate);
  let borrowEventsWithNullAssetValue = await BorrowEventRepository.getBorrowEventsSinceDateWithNullAssetPriceValue(startDate);
  let borrowEventsWithZeroAssetValue = await BorrowEventRepository.getBorrowEventsSinceDateWithZeroAssetPriceValue(startDate);

  console.log({
    // borrowEventsWithZeroUsdValue,
    'borrowEventsWithZeroUsdValue.length': borrowEventsWithZeroUsdValue.length,
    'borrowEventsToFill.length (NULL values on usd)': borrowEventsToFill.length,
    'borrowEventsWithNullAssetValue.length': borrowEventsWithNullAssetValue.length,
    'borrowEventsWithZeroAssetValue.length': borrowEventsWithZeroAssetValue.length,
  })

  for(let borrowEventToFill of borrowEventsWithNullAssetValue) {
    let {
      block_number,
      asset_address,
      amount,
      tx_index,
      tx_hash,
      log_index,
      block_metadata,
      network,
    } = borrowEventToFill;
    let {
      block_timestamp_unix
    } = block_metadata;
    if(block_timestamp_unix && asset_address && amount && network) {
      let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset_address, network, block_timestamp_unix);
      let assetRecord = await AssetRepository.findByColumn('address', asset_address);
      let borrowValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
      let eventFingerprint = getEventFingerprint(network, block_number, tx_index, log_index);
      let existingEventRecord = await BorrowEventRepository.findByColumn('event_fingerprint', eventFingerprint);
      if(existingEventRecord) {
        await BorrowEventRepository.update({usd_value_at_event_time: borrowValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
      }
      console.log({closest_price_time_diff: closestPrice.timeDiff, closest_price: closestPrice.price, amount_usd: borrowValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset_address, tx_hash});
    }
  }

  let repayEventsToFill = await RepayEventRepository.getRepayEventsSinceDateWithNullUsdValue(startDate);
  let repayEventsWithZeroUsdValue = await RepayEventRepository.getRepayEventsSinceDateWithZeroUsdValue(startDate);
  let repayEventsWithNullAssetValue = await RepayEventRepository.getRepayEventsSinceDateWithNullAssetPriceValue(startDate);
  let repayEventsWithZeroAssetValue = await RepayEventRepository.getRepayEventsSinceDateWithZeroAssetPriceValue(startDate);

  console.log({
    // repayEventsWithZeroUsdValue,
    'repayEventsWithZeroUsdValue.length': repayEventsWithZeroUsdValue.length,
    'repayEventsToFill.length (NULL values on usd)': repayEventsToFill.length,
    'repayEventsWithNullAssetValue.length': repayEventsWithNullAssetValue.length,
    'repayEventsWithZeroAssetValue.length': repayEventsWithZeroAssetValue.length,
  })

  for(let repayEventToFill of repayEventsWithNullAssetValue) {
    let {
      block_number,
      asset_address,
      amount,
      tx_index,
      tx_hash,
      log_index,
      block_metadata,
      network,
    } = repayEventToFill;
    let {
      block_timestamp_unix
    } = block_metadata;
    if(block_timestamp_unix && asset_address && amount && network) {
      let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset_address, network, block_timestamp_unix);
      let assetRecord = await AssetRepository.findByColumn('address', asset_address);
      let repayValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
      let eventFingerprint = getEventFingerprint(network, block_number, tx_index, log_index);
      let existingEventRecord = await RepayEventRepository.findByColumn('event_fingerprint', eventFingerprint);
      if(existingEventRecord) {
        await RepayEventRepository.update({usd_value_at_event_time: repayValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
      }
      console.log({closest_price_time_diff: closestPrice.timeDiff, closest_price: closestPrice.price, amount_usd: repayValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset_address, tx_hash});
    }
  }

  let depositEventsToFill = await DepositEventRepository.getDepositEventsSinceDateWithNullUsdValue(startDate);
  let depositEventsWithZeroUsdValue = await DepositEventRepository.getDepositEventsSinceDateWithZeroUsdValue(startDate);
  let depositEventsWithNullAssetValue = await DepositEventRepository.getDepositEventsSinceDateWithNullAssetPriceValue(startDate);
  let depositEventsWithZeroAssetValue = await DepositEventRepository.getDepositEventsSinceDateWithZeroAssetPriceValue(startDate);

  console.log({
    // depositEventsWithZeroUsdValue,
    'depositEventsWithZeroUsdValue.length': depositEventsWithZeroUsdValue.length,
    'depositEventsToFill.length (NULL values on usd)': depositEventsToFill.length,
    'depositEventsWithNullAssetValue.length': depositEventsWithNullAssetValue.length,
    'depositEventsWithZeroAssetValue.length': depositEventsWithZeroAssetValue.length,
  })

  for(let depositEventToFill of depositEventsWithNullAssetValue) {
    let {
      block_number,
      asset_address,
      amount,
      tx_index,
      tx_hash,
      log_index,
      block_metadata,
      network,
    } = depositEventToFill;
    let {
      block_timestamp_unix
    } = block_metadata;
    if(block_timestamp_unix && asset_address && amount && network) {
      let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset_address, network, block_timestamp_unix);
      let assetRecord = await AssetRepository.findByColumn('address', asset_address);
      let depositValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
      let eventFingerprint = getEventFingerprint(network, block_number, tx_index, log_index);
      let existingEventRecord = await DepositEventRepository.findByColumn('event_fingerprint', eventFingerprint);
      if(existingEventRecord) {
        await DepositEventRepository.update({usd_value_at_event_time: depositValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
      }
      console.log({closest_price_time_diff: closestPrice.timeDiff, closest_price: closestPrice.price, amount_usd: depositValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset_address, tx_hash});
    }
  }

  let withdrawEventsToFill = await WithdrawEventRepository.getWithdrawEventsSinceDateWithNullUsdValue(startDate);
  let withdrawEventsWithZeroUsdValue = await WithdrawEventRepository.getWithdrawEventsSinceDateWithZeroUsdValue(startDate);
  let withdrawEventsWithNullAssetValue = await WithdrawEventRepository.getWithdrawEventsSinceDateWithNullAssetPriceValue(startDate);
  let withdrawEventsWithZeroAssetValue = await WithdrawEventRepository.getWithdrawEventsSinceDateWithZeroAssetPriceValue(startDate);

  console.log({
    // withdrawEventsWithZeroUsdValue,
    'withdrawEventsWithZeroUsdValue.length': withdrawEventsWithZeroUsdValue.length,
    'withdrawEventsToFill.length (NULL values on usd)': withdrawEventsToFill.length,
    'withdrawEventsWithNullAssetValue.length': withdrawEventsWithNullAssetValue.length,
    'withdrawEventsWithZeroAssetValue.length': withdrawEventsWithZeroAssetValue.length,
  })

  for(let withdrawEventToFill of withdrawEventsWithNullAssetValue) {
    let {
      block_number,
      asset_address,
      amount,
      tx_index,
      tx_hash,
      log_index,
      block_metadata,
      network,
    } = withdrawEventToFill;
    let {
      block_timestamp_unix
    } = block_metadata;
    if(block_timestamp_unix && asset_address && amount && network) {
      let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset_address, network, block_timestamp_unix);
      let assetRecord = await AssetRepository.findByColumn('address', asset_address);
      let withdrawValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
      let eventFingerprint = getEventFingerprint(network, block_number, tx_index, log_index);
      let existingEventRecord = await WithdrawEventRepository.findByColumn('event_fingerprint', eventFingerprint);
      if(existingEventRecord) {
        await WithdrawEventRepository.update({usd_value_at_event_time: withdrawValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
      }
      console.log({closest_price_time_diff: closestPrice.timeDiff, closest_price: closestPrice.price, amount_usd: withdrawValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset_address, tx_hash});
    }
  }

}