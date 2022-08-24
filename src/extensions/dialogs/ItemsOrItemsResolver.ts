import { ItemsResolver } from "./ItemsResolver";
import { MapItemsResolver } from "./MapItemsResolver";


export type ItemsOrItemsResolver = string[] | ItemsResolver | { [id: string]: string; } | MapItemsResolver;
