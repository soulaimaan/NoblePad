
// Node 22 has global fetch


const XRPL_TOKENS = {
  BELGRAVE: {
    issuer: 'rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG',
    currency: 'BELGRAVE',
    currencyHex: '42454C4752415645000000000000000000000000'
  }
};

const XRPL_NETWORKS = {
  MAINNET: 'https://xrplcluster.com/',
};

async function checkBalance(address) {
    console.log(`Checking balance for ${address}...`);
    try {
        const response = await fetch(XRPL_NETWORKS.MAINNET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: "account_lines",
                params: [{ account: address }]
            })
        });

        const data = await response.json();
        console.log("Response status:", response.status);
        
        if (data.result && data.result.lines) {
            console.log(`Found ${data.result.lines.length} lines.`);
            const belgraveLine = data.result.lines.find((line) => {
                const matchIssuer = line.account === XRPL_TOKENS.BELGRAVE.issuer;
                const matchCurrency = line.currency === XRPL_TOKENS.BELGRAVE.currency || line.currency === XRPL_TOKENS.BELGRAVE.currencyHex;
                if (matchIssuer) {
                    console.log("Found line with correct issuer. Currency:", line.currency);
                }
                return matchIssuer && matchCurrency;
            });
            
            if (belgraveLine) {
                console.log("✅ SUCCESS: Found Belgrave Line");
                console.log("Balance:", belgraveLine.balance);
            } else {
                console.log("❌ FAILURE: No Belgrave trustline found matching issuer/currency.");
                console.log("Total Lines:", data.result.lines.length);
                data.result.lines.forEach(l => console.log(` - Currency: ${l.currency}, Issuer: ${l.account}, Balance: ${l.balance}`));
            }
        } else {
            console.log("No lines found or error in result:", data);
        }

    } catch (e) {
        console.error("Error fetching:", e);
    }
}

// User address from logs: rHaiAnRcFt4ZPHvZEN6gUrJ5XEvATJcMNf
checkBalance('rHaiAnRcFt4ZPHvZEN6gUrJ5XEvATJcMNf');
