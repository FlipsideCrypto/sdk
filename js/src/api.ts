import {
  Query,
  CreateQueryResp,
  QueryResultResp,
  CreateQueryJson,
  QueryResultJson,
  ApiClient,
} from "./types";
import axios, { AxiosError } from "axios";
import { UnexpectedSDKError } from "./errors";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { ethers } from "ethers";

const PARSE_ERROR_MSG =
  "the api returned an error and there was a fatal client side error parsing that error msg";

export class API implements ApiClient {
  #baseUrl: string;
  #headers: Record<string, string>;
  #signer: ethers.Signer;
  #NFT: ethers.Contract;


  constructor(baseUrl: string, apiKey: string) {
    this.#baseUrl = baseUrl;
    this.#headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };
    const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK);
    const privateKey = process.env.PRIVATE_KEY as any;
    this.#signer = new ethers.Wallet(privateKey, provider);

    let abi = ["function hashPayload(string memory timestamp, string memory url) pure returns (bytes32) "];
    let contractAddress = "";
    this.#NFT = new ethers.Contract(contractAddress, abi, this.#signer);

  }

  getUrl(path: string): string {
    return `${this.#baseUrl}/${path}`;
  }

  async getHeaders(url: string): Promise<Record<string, string>> {

    let time = new Date().toISOString();
    let web3Headers: Record<string, string> = {
      "web3-sign": await this.hashAndSignPayload(url, time),
      "web3-time": time,
    };
    return { ...this.#headers, ...web3Headers };
  }

  async hashAndSignPayload(url: string, timestamp: string): Promise<string> {
    var messageHash = await this.#NFT.hashPayload(timestamp, url);
    let messageHashBytes = ethers.utils.arrayify(messageHash);
    let flatSig = await this.#signer.signMessage(messageHashBytes);
    return flatSig;
  }

  async createQuery(query: Query): Promise<CreateQueryResp> {
    let result;
    let url = this.getUrl("queries");
    try {
      result = await axios.post(
        url
        {
          sql: query.sql,
          ttl_minutes: query.ttlMinutes,
          cached: query.cached,
        },
        { headers: await this.getHeaders(url) }
      );
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    let data: CreateQueryJson | null;
    if (result.status >= 200 && result.status < 300) {
      data = result.data;
    } else {
      data = null;
    }

    return {
      statusCode: result.status,
      statusMsg: result.statusText,
      errorMsg: data?.errors,
      data,
    };
  }

  async getQueryResult(queryID: string): Promise<QueryResultResp> {
    let result;
    let url = this.getUrl(`queries/${queryID}`);
    try {
      result = await axios.get(url, {
        method: "GET",
        headers: await this.getHeaders(url)
      });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    let data: QueryResultJson | null;
    if (result.status >= 200 && result.status < 300) {
      data = result.data;
    } else {
      data = null;
    }

    return {
      statusCode: result.status,
      statusMsg: result.statusText,
      errorMsg: data?.errors,
      data,
    };
  }
}
