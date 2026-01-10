
import hre from "hardhat";

async function main() {
    console.log("Checking environment variables...");
    console.log("INFURA_API_KEY present:", !!process.env.INFURA_API_KEY);
    console.log("DEPLOYER_PRIVATE_KEY present:", !!process.env.DEPLOYER_PRIVATE_KEY);
    try {
        console.log("Network:", hre.network.name);
    } catch (e) {
        console.log("Could not get network name");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
