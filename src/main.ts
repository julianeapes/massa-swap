import {
    generate_event,
    include_base64,
    create_sc,
    call,
    print,
} from "massa-sc-std";
import { AllowArgs, MintArgs, TokenInitializeArgs } from "./token";
import { SwapInitializerParams, SwapParams } from "./swap";
import { JSON } from "json-as";

// Create a Token
function createToken(
    name: string,
    symbol: string,
    supply: u32,
    decimals: u32
): string {
    const bytes = include_base64("./build/token.wasm");
    const token = create_sc(bytes);
    call(
        token,
        "initialize",
        JSON.stringify<TokenInitializeArgs>({ name, symbol, supply, decimals }),
        0
    );
    generate_event(
        `Token: ${name}, Symbol: ${symbol}, Address: ${token}, Supply: ${supply.toString()}.`
    );
    return token;
}

function createSwapper(token0: string, token1: string): string {
    const bytes = include_base64("./build/swap.wasm");
    const swapper = create_sc(bytes);
    call(
        swapper,
        "initialize",
        JSON.stringify<SwapInitializerParams>({ token0, token1 }),
        0
    );
    generate_event(
        `Created Swap contract for tokens ${token0} & ${token1} at address ${swapper}.`
    );
    return swapper;
}

function mint(token: string, receiver: string, amount: u32): void {
    call(
        token,
        "mint",
        JSON.stringify<MintArgs>({ address: receiver, amount }),
        0
    );
}

function setAllowance(token: string, swapper: string, amount: u32): void {
    call(
        token,
        "allow",
        JSON.stringify<AllowArgs>({ spender: swapper, amount }),
        0
    );
}

function swap(
    swapper: string,
    token0: string,
    amount0: u32,
    token1: string,
    amount1: u32
): void {
    call(
        swapper,
        "swap",
        JSON.stringify<SwapParams>({
            tokenIn: token0,
            tokenOut: token1,
            amountIn: amount0,
            amountOut: amount1,
        }),
        0
    );
}

export function main(_args: string): i32 {
    generate_event("Initializing Tokens...");
    const token0 = createToken("SimpleToken0", "TOK0", 1000000, 18);
    const token1 = createToken("SimpleToken1", "TOK1", 1000000, 18);

    generate_event("Initializing Swapper...");
    const swapper = createSwapper(token0, token1);

    generate_event("Mint Tokens and send it to the swap contract...");
    mint(token0, swapper, 5000);
    mint(token1, swapper, 5000);

    generate_event("Approving Tokens...");
    setAllowance(token0, swapper, 1000000);
    setAllowance(token1, swapper, 1000000);

    generate_event("Swapping Tokens...");
    swap(swapper, token0, 100, token1, 200);
    swap(swapper, token1, 800, token0, 400);

    print("Swap Succeeds");

    return 0;
}
