export interface Attribute {
  [key: string]: string;
}

export interface Media {
  thumb: string;
  social: string;
  [key: string]: string;
}

export interface NftDescriptor {
  version: 1;
  name: string;
  title: string;
  description: string;
  collectionId?: string;
  edition?: string;
  identifier?: number;
  symbol?: string;
  attributes?: Attribute[];
  media: Media[];
}
