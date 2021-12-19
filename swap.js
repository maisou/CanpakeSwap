// Swap BNB -> Tokens

// node swap.js <bnb amount> <token contract>
// ex. swap.js 0.1 0xe9e7cea3dedca5984780bafc599bd69add087d56  <-- swap 0.1 bnb to busd

const ethers = require('ethers')
const { JsonRpcProvider } = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://binance.ankr.com');
const Seed = "" // Seed phrase
const wallet = ethers.Wallet.fromMnemonic(Seed)
const account = wallet.connect(provider)

const addresses = {
    WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    buyer: '' // Your Wallet Address
}
const router = new ethers.Contract(
    addresses.router,
    [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    account
)

var args = process.argv.slice(2);

const swapBNBforTokens = async () => {

    let amount_BNB = args[0]
    let buy_token = args[1]
    let amountIn = ethers.utils.parseUnits(amount_BNB, 'ether');
    let amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, buy_token]);
    let amountOutMin = amounts[1].sub(amounts[1].div(60)); // Slippage 60 = 40% , 80 = 20% etc.

    console.log(`
        Pancake Swap
        ----------
        |-  from BNB: ${ethers.utils.formatEther(amountIn).toString()} ( Address : ${addresses.WBNB} )
        |-  to Token: ${ethers.utils.formatEther(amountOutMin).toString()} ( Address : ${buy_token} )
    `)
    
    const tx = await router.swapExactETHForTokens(
        amountOutMin,
        [addresses.WBNB, buy_token],
        addresses.buyer,
        Math.floor(Date.now() / 1000) + 60 * 5, 
        {
            gasLimit: ethers.utils.hexlify(3000000),
            gasPrice: ethers.utils.parseUnits("5", "gwei"),
            value: amountIn
        }
    )
    
    const receipt = await tx.wait()
    console.log(`
        TX : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}
    `)
        

}
swapBNBforTokens()
