const NonFungibleApesV2 = artifacts.require("NonFungibleApesV2");
const { getDeployConfig } = require("../deploy-config");


module.exports = async function (deployer, network, accounts) {
  const [deployerAccount] = accounts;
  const { admin, name, symbol, baseTokenURI } = getDeployConfig(network, accounts);

  // Deploy NFA Contract
  // constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
  await deployer.deploy(NonFungibleApesV2, name, symbol, baseTokenURI, { from: deployerAccount });
  const nfaContract = await NonFungibleApesV2.at(NonFungibleApesV2.address);

  let adminHasAdminRole;
  let adminHasMinterRole;
  let deployerHasAdminRole;
  let deployerHasMinterRole;


  /**
   * Setup Roles
   */
  if (admin) {
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
    adminHasAdminRole = await nfaContract.hasRole(DEFAULT_ADMIN_ROLE, admin, { from: deployerAccount });
    adminHasMinterRole = await nfaContract.hasRole(MINTER_ROLE, admin, { from: deployerAccount });
    deployerHasAdminRole = await nfaContract.hasRole(DEFAULT_ADMIN_ROLE, deployerAccount, { from: deployerAccount });
    deployerHasMinterRole = await nfaContract.hasRole(MINTER_ROLE, deployerAccount, { from: deployerAccount });
  }

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