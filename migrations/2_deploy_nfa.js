const NonFungibleApes = artifacts.require("NonFungibleApes");
const { getDeployConfig } = require("../deploy-config");


module.exports = async function (deployer, network, accounts) {
  const [deployerAccount] = accounts;
  const { admin, name, symbol, baseTokenURI } = getDeployConfig(network, accounts);

  // Deploy NFA Contract
  // constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
  await deployer.deploy(NonFungibleApes, name, symbol, baseTokenURI, { from: deployerAccount });
  const nfaContract = await NonFungibleApes.at(NonFungibleApes.address);

  /**
   * Setup Roles
   */
  // Transfer ownership to admin
  const DEFAULT_ADMIN_ROLE = await nfaContract.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await nfaContract.MINTER_ROLE();
  // Grant admin proper roles
  await nfaContract.grantRole(DEFAULT_ADMIN_ROLE, admin, { from: deployerAccount });
  await nfaContract.grantRole(MINTER_ROLE, admin, { from: deployerAccount });
  // Renounce admin from deployer
  await nfaContract.renounceRole(DEFAULT_ADMIN_ROLE, deployerAccount, { from: deployerAccount });
  await nfaContract.renounceRole(MINTER_ROLE, deployerAccount, { from: deployerAccount });
  // Verify results
  const adminHasAdminRole = await nfaContract.hasRole(DEFAULT_ADMIN_ROLE, admin, { from: deployerAccount });
  const adminHasMinterRole = await nfaContract.hasRole(MINTER_ROLE, admin, { from: deployerAccount });
  const deployerHasAdminRole = await nfaContract.hasRole(DEFAULT_ADMIN_ROLE, deployerAccount, { from: deployerAccount });
  const deployerHasMinterRole = await nfaContract.hasRole(MINTER_ROLE, deployerAccount, { from: deployerAccount });

  // Log/verify results
  console.dir({
    nfaContract: nfaContract.address,
    admin,
    adminHasAdminRole,
    adminHasMinterRole,
    deployerHasAdminRole,
    deployerHasMinterRole,
  })
}