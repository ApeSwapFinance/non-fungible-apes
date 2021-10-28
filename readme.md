# ApeSwap's Official Non Fungible Apes V2 (NFAv2)

Non Fungible Apes (or NFAs) are a cryptographically generated set of 1,000 unique, rare, and immutable apes forked from the original CryptoPunks codebase.

Find the official Non Fungible Apes V2 smart contract deployment at this address: [0x6afC012783e3a6eF8C5f05F8EeE2eDeF6a052Ec4](https://bscscan.com/token/0x6afC012783e3a6eF8C5f05F8EeE2eDeF6a052Ec4)


## How Were NFAs Generated?

Each ape was created by processing a string (such as "Strong Ape"), resulting in a hash that is used to randomly select a set of 6 characteristics: Base Color, Face Color, Frame, Mouth, Eyes, and Top. These 6 characteristics are layered on top of each other to generate a unique NFA. Accounting for all permutations, there are a total of over 125,000 potential options, but only a very scarce set of 1,000 apes were created. See a list of all attributes in the `info` folder.


## How Can You Tell an NFA's Rarity?

Each ape has a commutative score generated based on the combined rarity of its characteristics. Basically the rarity of each individual characteristic is multiplied to create an overall "Rarity Score" for the ape. The closer that score is to 0, the more rare the ape. 

We then categorize that score into one of five different tiers to determine overall rarity. The rarity tiers are as follows:

- **Common Chimps**: Tier 1 (500 NFAs) - Most common
- **Original Orangutans**: Tier 2 (250 NFAs)
- **Alluring Apes**: Tier 3 (150 NFAs)
- **Prime Primates**: Tier 4 (70 NFAs)
- **Magic Monkeys**: Tier 5 (30 NFAs) - Most rare

Each characteristic has a different likelihood of occurring in each ape generation, making some characteristics much more rare than others. For instance, only 32 apes have lazer eyes and only 107 apes have sunglasses. You can see the full breakdown of how many occurrences each characteristic has in the `apesAttributeStats.json` file.


## Tools

### Ganache Internal
Using ganache internal to simulate a mempool locally.
`yarn add -D ganache@internal`