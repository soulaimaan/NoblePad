
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256'; // keccak256 from 'keccak256' package
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// In a real scenario, this data comes from the XRPL snapshot (mapped to EVM addresses)
const STAKERS = [
    { address: "0x81e8F8220e7536db2072870aB0526571E60DB293", tier: 3, maxAlloc: ethers.parseEther("5") }, // Gold
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", tier: 2, maxAlloc: ethers.parseEther("2") }, // Silver
    { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", tier: 1, maxAlloc: ethers.parseEther("1") }, // Bronze
];

function main() {
    console.log("📸 Generating Snapshot Merkle Tree...");

    const leaves = STAKERS.map(x =>
        ethers.solidityPackedKeccak256(
            ["address", "uint8", "uint256"],
            [x.address, x.tier, x.maxAlloc]
        )
    );

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    console.log(`\n🌳 Merkle Root: ${root}`);

    const proofs = {};
    STAKERS.forEach((staker, index) => {
        const leaf = leaves[index];
        const proof = tree.getHexProof(leaf);
        proofs[staker.address] = {
            tier: staker.tier,
            maxAlloc: staker.maxAlloc.toString(),
            proof: proof
        };
    });

    const outputPath = path.join(__dirname, '../snapshot-data.json');
    fs.writeFileSync(outputPath, JSON.stringify({ root, proofs }, null, 2));

    console.log(`✅ Snapshot data saved to: ${outputPath}`);
}

main();
