import {
  TvlMinutelyRepository,
  TvlHourlyRepository,
  BorrowedMinutelyRepository,
  BorrowedHourlyRepository,
} from '../../database/repositories';

// Silo Subgraph 2.1.0 -> 2.0.3 caused some data corruption, this deletes the latest records (2022-12-13T18:44:00.000Z onwards) for TVL of XAI and USDC

export const runPatch = async () => {
  // delete "all silo" TVL records newer than 2022-12-13T18:44:00.000Z
  let resultsAllMinutelyTvl = await TvlMinutelyRepository.query().delete().where(function (this: any) {
    this.where('meta', 'all');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsAllHourlyTvl = await TvlHourlyRepository.query().delete().where(function (this: any) {
    this.where('meta', 'all');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  // delete XAI TVL records newer than 2022-12-13T18:44:00.000Z
  let resultsXaiMinutelyTvl = await TvlMinutelyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xC8CD77d4cd9511f2822f24aD14FE9e3C97C57836');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsXaiHourlyTvl = await TvlHourlyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xC8CD77d4cd9511f2822f24aD14FE9e3C97C57836');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  // delete XAI TVL records newer than 2022-12-13T18:44:00.000Z
  let resultsUsdcMinutelyTvl = await TvlMinutelyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xFCCc27AABd0AB7a0B2Ad2B7760037B1eAb61616b');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsUsdcHourlyTvl = await TvlHourlyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xFCCc27AABd0AB7a0B2Ad2B7760037B1eAb61616b');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  // delete "all silo" Borrowed records newer than 2022-12-13T18:44:00.000Z
  let resultsAllMinutelyBorrowed = await BorrowedMinutelyRepository.query().delete().where(function (this: any) {
    this.where('meta', 'all');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsAllHourlyBorrowed = await BorrowedHourlyRepository.query().delete().where(function (this: any) {
    this.where('meta', 'all');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  // delete XAI Borrowed records newer than 2022-12-13T18:44:00.000Z
  let resultsXaiMinutelyBorrowed = await BorrowedMinutelyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xC8CD77d4cd9511f2822f24aD14FE9e3C97C57836');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsXaiHourlyBorrowed = await BorrowedHourlyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xC8CD77d4cd9511f2822f24aD14FE9e3C97C57836');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  // delete XAI Borrowed records newer than 2022-12-13T18:44:00.000Z
  let resultsUsdcMinutelyBorrowed = await BorrowedHourlyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xFCCc27AABd0AB7a0B2Ad2B7760037B1eAb61616b');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });
  let resultsUsdcHourlyBorrowed = await BorrowedHourlyRepository.query().delete().where(function (this: any) {
    this.where('silo_address', '0xFCCc27AABd0AB7a0B2Ad2B7760037B1eAb61616b');
    this.whereRaw(`timestamp > '2022-12-13T18:44:00.000Z'`);
  });

  console.log({resultsAllMinutelyTvl, resultsAllHourlyTvl, resultsXaiMinutelyTvl, resultsXaiHourlyTvl, resultsUsdcMinutelyTvl, resultsUsdcHourlyTvl, resultsAllMinutelyBorrowed, resultsAllHourlyBorrowed, resultsXaiMinutelyBorrowed, resultsXaiHourlyBorrowed, resultsUsdcMinutelyBorrowed, resultsUsdcHourlyBorrowed});
}