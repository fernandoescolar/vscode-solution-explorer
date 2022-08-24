import { SearchItemsResolver } from "./SearchItemsResolver";
import { SearchMapItemsResolver } from "./SearchMapItemsResolver";


export type SearchResolver = SearchItemsResolver | SearchMapItemsResolver;
