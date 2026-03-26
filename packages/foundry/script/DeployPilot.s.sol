// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";

// Pilot contracts
import { CityToken } from "../contracts/pilot/token/CityToken.sol";
import { VoteToken } from "../contracts/pilot/token/VoteToken.sol";
import { IssuerRegistry } from "../contracts/pilot/identity/IssuerRegistry.sol";
import { OpportunityManager } from "../contracts/pilot/opportunity/OpportunityManager.sol";
import { TaskProposalRegistry } from "../contracts/pilot/opportunity/TaskProposalRegistry.sol";
import { RedeemerRegistry } from "../contracts/pilot/redeem/RedeemerRegistry.sol";
import { RedemptionReceipt } from "../contracts/pilot/redeem/RedemptionReceipt.sol";
import { Redemption } from "../contracts/pilot/redeem/Redemption.sol";
import { MCEGovernor } from "../contracts/pilot/governance/MCEGovernor.sol";
import { FeedbackRegistry } from "../contracts/pilot/feedback/FeedbackRegistry.sol";

/// @title DeployPilot — Production deployment script for CitySync Pilot.
/// @notice Deploys all 10 pilot contracts in dependency order and wires cross-contract roles.
///
/// Prerequisites — set in your .env file:
///   DEPLOYER_PRIVATE_KEY  — wallet that pays gas and becomes admin on all contracts
///   CITY_NAME             — display name for the pilot city (e.g. "Berkeley")
///   CITY_CREDIT_SYMBOL    — token symbol for civic credits (e.g. "BERK")
///
/// Usage:
///   # Dry run (no broadcast)
///   forge script script/DeployPilot.s.sol --rpc-url baseSepolia
///
///   # Live broadcast to Base Sepolia
///   forge script script/DeployPilot.s.sol --rpc-url baseSepolia --broadcast --verify
///
/// After deployment, contract addresses are written to deployments/<chainId>-pilot.json
/// and printed to console.
contract DeployPilot is Script {

    // ---------- Deployed contract references ----------
    CityToken           public city;
    VoteToken           public vote;
    IssuerRegistry      public issuerReg;
    OpportunityManager  public oppMgr;
    TaskProposalRegistry public taskPropReg;
    RedeemerRegistry    public redeemerReg;
    RedemptionReceipt   public receipt;
    Redemption          public redemption;
    MCEGovernor         public mceGov;
    FeedbackRegistry    public feedback;

    function run() external {
        // ---- Read environment ----
        uint256 deployerPk  = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin       = vm.addr(deployerPk);
        string memory cityName     = vm.envOr("CITY_NAME", string("xCity"));
        string memory creditSymbol = vm.envOr("CITY_CREDIT_SYMBOL", string("CITY"));

        console2.log("=== CitySync Pilot Deployment ===");
        console2.log("Network chain ID:", block.chainid);
        console2.log("Admin (deployer):", admin);
        console2.log("City name:       ", cityName);
        console2.log("");

        vm.startBroadcast(deployerPk);

        // ============================================================
        // 1. TOKEN LAYER — No dependencies
        // ============================================================

        city = new CityToken(
            string(abi.encodePacked(cityName, " Civic Credit")),
            creditSymbol,
            admin
        );

        vote = new VoteToken(
            string(abi.encodePacked(cityName, " Vote")),
            string(abi.encodePacked(creditSymbol, "VOTE")),
            admin
        );

        // ============================================================
        // 2. IDENTITY LAYER — No dependencies
        // ============================================================

        issuerReg = new IssuerRegistry(admin);

        // ============================================================
        // 3. GOVERNANCE LAYER — Depends on VoteToken, IssuerRegistry
        // ============================================================

        mceGov = new MCEGovernor(admin, vote, issuerReg);

        // ============================================================
        // 4. OPPORTUNITY LAYER — Depends on tokens + identity
        // ============================================================

        oppMgr = new OpportunityManager(admin, city, vote, issuerReg);

        // Wire MCEGovernor into OpportunityManager
        oppMgr.setMCEGovernor(address(mceGov));

        taskPropReg = new TaskProposalRegistry(admin, issuerReg);

        // ============================================================
        // 5. REDEMPTION LAYER — Depends on tokens
        // ============================================================

        redeemerReg = new RedeemerRegistry(admin);
        receipt     = new RedemptionReceipt(admin);
        redemption  = new Redemption(admin, city, redeemerReg, receipt);

        // ============================================================
        // 6. FEEDBACK LAYER — Depends on CityToken
        // ============================================================

        feedback = new FeedbackRegistry(admin, city);

        // ============================================================
        // 7. WIRE CROSS-CONTRACT ROLES
        // ============================================================

        // OpportunityManager mints CityToken + VoteToken on verification
        city.grantRole(city.MINTER_ROLE(), address(oppMgr));
        vote.grantRole(vote.MINTER_ROLE(), address(oppMgr));

        // Redemption burns CityToken and mints RedemptionReceipts
        city.grantRole(city.BURNER_ROLE(), address(redemption));
        receipt.grantRole(receipt.MINTER_ROLE(), address(redemption));

        // OpportunityManager updates IssuerRegistry stats after verification
        issuerReg.grantRole(issuerReg.STATS_UPDATER_ROLE(), address(oppMgr));

        vm.stopBroadcast();

        // ============================================================
        // 8. EXPORT + PRINT
        // ============================================================

        _printAddresses();
        _exportDeployments();
    }

    function _printAddresses() internal view {
        console2.log("");
        console2.log("=== Pilot Deployed Addresses ===");
        console2.log("");
        console2.log("-- Tokens --");
        console2.log("CityToken:           ", address(city));
        console2.log("VoteToken:           ", address(vote));
        console2.log("");
        console2.log("-- Identity --");
        console2.log("IssuerRegistry:      ", address(issuerReg));
        console2.log("");
        console2.log("-- Governance --");
        console2.log("MCEGovernor:         ", address(mceGov));
        console2.log("");
        console2.log("-- Opportunities --");
        console2.log("OpportunityManager:  ", address(oppMgr));
        console2.log("TaskProposalRegistry:", address(taskPropReg));
        console2.log("");
        console2.log("-- Redemption --");
        console2.log("RedeemerRegistry:    ", address(redeemerReg));
        console2.log("RedemptionReceipt:   ", address(receipt));
        console2.log("Redemption:          ", address(redemption));
        console2.log("");
        console2.log("-- Feedback --");
        console2.log("FeedbackRegistry:    ", address(feedback));
        console2.log("");
        console2.log("-- Frontend .env --");
        console2.log("NEXT_PUBLIC_CITY_TOKEN=          ", address(city));
        console2.log("NEXT_PUBLIC_VOTE_TOKEN=          ", address(vote));
        console2.log("NEXT_PUBLIC_ISSUER_REGISTRY=     ", address(issuerReg));
        console2.log("NEXT_PUBLIC_MCE_GOVERNOR=        ", address(mceGov));
        console2.log("NEXT_PUBLIC_OPP_MANAGER=         ", address(oppMgr));
        console2.log("NEXT_PUBLIC_TASK_PROPOSAL_REG=   ", address(taskPropReg));
        console2.log("NEXT_PUBLIC_REDEEMER_REGISTRY=   ", address(redeemerReg));
        console2.log("NEXT_PUBLIC_REDEMPTION_RECEIPT=  ", address(receipt));
        console2.log("NEXT_PUBLIC_REDEMPTION=          ", address(redemption));
        console2.log("NEXT_PUBLIC_FEEDBACK_REGISTRY=   ", address(feedback));
    }

    function _exportDeployments() internal {
        string memory json;
        string memory chainIdStr = vm.toString(block.chainid);

        vm.serializeAddress(json, "CityToken",            address(city));
        vm.serializeAddress(json, "VoteToken",            address(vote));
        vm.serializeAddress(json, "IssuerRegistry",       address(issuerReg));
        vm.serializeAddress(json, "MCEGovernor",          address(mceGov));
        vm.serializeAddress(json, "OpportunityManager",   address(oppMgr));
        vm.serializeAddress(json, "TaskProposalRegistry", address(taskPropReg));
        vm.serializeAddress(json, "RedeemerRegistry",     address(redeemerReg));
        vm.serializeAddress(json, "RedemptionReceipt",    address(receipt));
        vm.serializeAddress(json, "Redemption",           address(redemption));
        json = vm.serializeAddress(json, "FeedbackRegistry", address(feedback));

        string memory outPath = string(
            abi.encodePacked(vm.projectRoot(), "/deployments/", chainIdStr, "-pilot.json")
        );
        vm.writeJson(json, outPath);
        console2.log("Deployment addresses written to: deployments/", chainIdStr, "-pilot.json");
    }
}
