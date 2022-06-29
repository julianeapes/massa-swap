import { JSON } from "json-as";
import { Storage, print, Context, call, generate_event } from "massa-sc-std";
import { TransferFromArgs, TransferArgs } from "./token";

// Storage Keys

const IS_INITIALIZED = "isInitialized";
const TOKEN_0 = "token0";
const TOKEN_1 = "token1";
const SC_ADDRESS = "scAddress";

// Parameter models

@json
export class SwapInitializerParams {
    token0: string = "";
    token1: string = "";
}

@json
export class SwapParams {
    tokenIn: string = "";
    amountIn: u32 = 0;
    tokenOut: string = "";
    amountOut: u32 = 0;
}

// Functions

// Define the tokens that the contract can swap and the owner.
export function initialize(_args: string): void {
    // Ensure initialize can be called only during initialization
    assert(
        Storage.get_data_or_default(IS_INITIALIZED, "false") == "false",
        "Contract already initialized"
    );

    const params = JSON.parse<SwapInitializerParams>(_args);
    Storage.set_data(TOKEN_0, params.token0);
    Storage.set_data(TOKEN_1, params.token1);
    Storage.set_data(IS_INITIALIZED, "true");

    const addresses = Context.get_call_stack();
    Storage.set_data(SC_ADDRESS, addresses[addresses.length - 1]);
}

// Swap x tokenIn to y tokenOut.
export function swap(_args: string): void {
    const caller = Context.get_tx_creator();
    const params = JSON.parse<SwapParams>(_args);

    // Transfer x tokenIn to this contract
    call(
        params.tokenIn,
        "transferFrom",
        JSON.stringify<TransferFromArgs>({
            owner: caller,
            to: scAddress(),
            amount: params.amountIn,
        }),
        0
    );

    // Transfer y tokenOut to the caller
    call(
        params.tokenOut,
        "transfer",
        JSON.stringify<TransferArgs>({
            to: caller,
            amount: params.amountOut,
        }),
        0
    );

    generate_event(
        `Swaps ${params.amountIn} token0 to ${params.amountOut} token1 by caller ${caller}`
    );
}

// Storage
export function scAddress(): string {
    return Storage.get_data(SC_ADDRESS);
}

export function token0(): string {
    return Storage.get_data(TOKEN_0);
}

export function token1(): string {
    return Storage.get_data(TOKEN_1);
}

export function token0Balance(): string {
    return call(token0(), "balanceOf", scAddress(), 0);
}

export function token1Balance(): string {
    return call(token1(), "balanceOf", scAddress(), 0);
}
