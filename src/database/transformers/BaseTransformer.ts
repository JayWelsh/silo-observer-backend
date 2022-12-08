class BaseTransformer {
  transform?: (datum: any) => void;
  constructor() {
      //@ts-ignore
      if (this.transform === undefined) {
          throw new TypeError("Transformer should have 'transform' method defined.")
      }
  }
}

export default BaseTransformer;
