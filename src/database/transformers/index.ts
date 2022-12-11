import RateOutputTransformer from './rate/output';

interface ITransformer {
  transform: (arg0: any) => any;
  constructor: any;
}

export {
  RateOutputTransformer,
  ITransformer,
}