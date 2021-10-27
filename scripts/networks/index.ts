require('dotenv').config();
import { ethers } from 'ethers';
import { NonceManager } from "@ethersproject/experimental";

const providerByChainId: { [key:number]: { provider: string; env: 'DEV_DEPLOYER_KEY' | 'TESTNET_DEPLOYER_KEY' | 'MAINNET_DEPLOYER_KEY' } } = {
    0: {
        provider: "http://localhost:8545",
        env: 'DEV_DEPLOYER_KEY',
    },
    56: {
        provider: "https://bsc-dataseed1.binance.org",
        env: 'MAINNET_DEPLOYER_KEY',
    },
    97: {
        provider: "https://data-seed-prebsc-1-s1.binance.org:8545",
        env: 'TESTNET_DEPLOYER_KEY',
    },
}

const getProviderByChainId = (chainId: number) => {
    const providerUrl = providerByChainId[chainId];
    if(!providerUrl) {
        throw new Error(`Provider URL for chainId ${chainId} currently not supported.`)
    }
    return providerUrl;
}

/**
 * Get a JsonRpc provider for a given chainId.
 * 
 * @param chainId 
 * @returns 
 */
export const getProvider = (chainId = 56): ethers.providers.JsonRpcProvider => {
    return new ethers.providers.JsonRpcProvider(getProviderByChainId(chainId).provider);
}

/**
 * Get the a signing wallet attached to a chainId. 
 * Provide mnemonic phrases in a .env file which are used for the wallet creation.
 * 
 * @param chainId 
 * @returns 
 */
export const getSigner = (chainId = 56): ethers.Wallet => {
    const providerDetails = getProviderByChainId(chainId);
    const provider = getProvider(chainId);
    const mnemonic = process.env[providerDetails.env];
    if(!mnemonic) {
        throw new Error(`No mnemonic in .env for chainID ${chainId} env variable: ${providerDetails.env}.`)
    }
    
    let signer: ethers.Wallet;
    try {
        signer = ethers.Wallet.fromMnemonic(mnemonic);
    } catch (e) {
        // 
        signer = new ethers.Wallet(mnemonic);
    }
    return signer.connect(provider);
}

/**
 * Use the nonce manager to manage the nonce of a wallet attached to a given chainId.
 * https://docs.ethers.io/v5/api/experimental/#experimental-noncemanager
 * 
 * @param chainId 
 * @returns NonceManger
 */
export const getNonceManager = (chainId = 56): NonceManager => {
    const wallet = getSigner(chainId);
    return new NonceManager(wallet);
}