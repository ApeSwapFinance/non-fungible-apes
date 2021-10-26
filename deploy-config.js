function getDeployConfig(network, accounts) {
    if (["bsc", "bsc-fork"].includes(network)) {
        console.log(`Deploying with BSC MAINNET config.`)
        return {
            admin: "0x6c905b4108A87499CEd1E0498721F2B831c6Ab13", 
            name: "Non Fungible Apes", 
            symbol: "NFA", 
            baseTokenURI: "ipfs://QmUN19SQ6bV5FU6vZGGkaefXAr9YkpWrH8iLy3QHFnksF1/", // Production NFA IPFS location
        }
    } else if (['bsc-testnet', 'bsc-testnet-fork'].includes(network)) {
        console.log(`Deploying with BSC testnet config.`)
        return {
            admin: "0xE375D169F8f7bC18a544a6e5e546e63AD7511581", // Testnet
            name: "Non Fungible Apes", 
            symbol: "NFA", 
            baseTokenURI: "ipfs://QmUN19SQ6bV5FU6vZGGkaefXAr9YkpWrH8iLy3QHFnksF1/",
        }
    } else if (['development'].includes(network)) {
        console.log(`Deploying with development config.`)
        return {
            admin: "0x6c905b4108A87499CEd1E0498721F2B831c6Ab13", 
            name: "Non Fungible Apes", 
            symbol: "NFA", 
            baseTokenURI: "",
        }
    } else {
        throw new Error(`No config found for network ${network}.`)
    }
}

module.exports = { getDeployConfig };
