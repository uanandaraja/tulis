import Exa from "exa-js";
import { config } from "./config";

export const exa = config.exa ? new Exa(config.exa.apiKey) : null;
