# **Solana Native/Vanilla Unit Tests Using Bankrun and Vitest**

This repository contains comprehensive unit tests for the `processor.rs` module of a Solana Native program using Codigo. The tests aim to achieve 100% test coverage by validating all key functionalities such as minting, transferring, and burning NFTs. The unit tests utilize the `solana-bankrun` framework to simulate real-world transactions, covering edge cases, signature verification, ownership checks, and more. Additionally, `Vitest` is used as the test runner due to its speed and easy out-of-the-box configuration.

## **Table of Contents**
- [Overview](#overview)
- [Key Components of the Unit Tests](#key-components-of-the-unit-tests)
- [Why Solana-Bankrun is a Better Testing Framework](#why-solana-bankrun-is-a-better-testing-framework)
- [Challenges and Limitations](#challenges-and-limitations)
- [Unit Test Execution Instructions](#unit-test-execution-instructions)
- [Conclusion](#conclusion)

---

## **Overview**

The goal of this project is to implement robust unit tests for the `processor.rs` module. These tests ensure correct program behavior, covering scenarios like minting, transferring, and burning NFTs, while validating critical elements like ownership, signatures, and account association.

The tests use `solana-bankrun` for an efficient and realistic testing environment that closely mirrors the actual Solana blockchain. 

---

## **Key Components of the Unit Tests**

1. **Basic NFT Minting:**
   - Tests the successful minting of an NFT with valid parameters.
   
2. **Duplicate Minting:**
   - Validates that NFTs cannot be minted twice with the same mint key.
   - Ensures that the program rejects duplicate minting attempts.

3. **NFT Transfer:**
   - Tests the successful transfer of an NFT between two wallets, verifying that the destination account reflects the new ownership.
   - Tests failure cases, such as transferring to an unassociated or incorrect account.

4. **Signature Verification:**
   - Ensures that all NFT transfers require proper authorization from the source wallet.
   - Fails transfers that do not include the necessary signatures.

5. **Burning NFTs:**
   - Tests both successful and unauthorized attempts to burn NFTs.
   - Ensures that only the NFT owner can initiate a burn operation.

6. **Handling Burnt NFTs:**
   - Verifies that once an NFT is burned, it can no longer be transferred.

---

## **Why Solana-Bankrun is a Better Testing Framework**

`bankrun` is a superfast, powerful, and lightweight framework for testing Solana programs in Node.js. It offers significant advantages over traditional methods like `solana-test-validator` for the following reasons:

### 1. **Speed and Convenience**
   - `bankrun` is **orders of magnitude faster** than `solana-test-validator`, making it ideal for rapid development cycles. You can run tests much more quickly, which allows for continuous iteration and improvement. This is particularly advantageous for leveraging Vitest's speed and easy configuration.

### 2. **Advanced Features**
   - With `bankrun`, you can do things that aren't possible with `solana-test-validator`, such as:
     - **Jumping back and forth in time**: This allows you to simulate future or past block heights and conditions, which can be useful for testing specific edge cases.
     - **Dynamically setting account data**: Modify account states on the fly, making it easy to simulate various scenarios without requiring complex transaction logic.

### 3. **Familiar Interface**
   - If you’ve used `solana-program-test`, you’ll feel right at home with `bankrun`. `bankrun` builds on top of `solana-program-test`, which works by spinning up a lightweight `BanksServer` that acts like an RPC node but is much faster.
   - It creates a `BanksClient` to communicate with this lightweight server, allowing you to simulate the Solana network with minimal resource overhead.

### 4. **Production-Ready Boilerplate**
   - The code you generate and test with `bankrun` is closer to being production-ready. It simulates Solana’s program execution environment efficiently, ensuring that your tests reflect real-world conditions as closely as possible while still benefiting from the speed of local simulation.

### 5. **Comparison with Solana-Test-Validator**
   - While `solana-test-validator` is still useful for testing certain interactions with RPC methods or behaviors specific to a full Solana validator node, `bankrun` excels when the focus is on **testing your program logic** and **client interactions**.

In summary, `bankrun` combines speed, advanced features, and ease of use to provide a superior testing framework for Solana development, especially in fast-paced environments where time efficiency and flexibility are critical.

---

## **Challenges and Limitations**

- **RPC Method Support**: Although `solana-bankrun` is faster and more convenient, it is less similar to a real RPC node. Some Solana RPC methods might not be supported by `BanksServer`, the backend for `solana-bankrun`. In cases where you need to call unsupported RPC methods, it is better to use `solana-test-validator`, which more closely mimics a real Solana node.

- **Real-Life Validator Behavior**: `solana-bankrun` focuses primarily on testing your program and client code in a simulated environment. However, it does not fully replicate real-life validator behavior. If you need to test scenarios where validator-specific behavior is critical, such as complex transaction finalization, leader election, or performance under high network load, then using `solana-test-validator` would provide a more accurate simulation of a real Solana cluster.

In summary, while `solana-bankrun` is ideal for quick, local testing and significantly speeds up the development process, you should switch to `solana-test-validator` when you need to test interactions with real RPC nodes or behavior specific to Solana's network architecture. I am yet to delve into the Codigo examples further to know if I would run into challenges, but for now, this seems to be a perfect choice.

---

## **Unit Test Execution Instructions**

### **Prerequisites**

Make sure you have the following dependencies installed:
- Node.js
- Solana CLI
- All dependencies listed in the `package.json`

### **Running the Tests**

1. **Navigate to the `program_client` Directory:**
   ```bash
   cd program_client
   ```

2. **Install all required packages using `npm`:**
   ```bash
   npm install
   ```
2. **Run tests using `vitest`:**
   ```bash
   npx vitest
   ```

### Additional Files:

- **Test File:** `./program_client/tests/app.test.ts`
- **Library File:** `./program_client/lib/bankrun_rpc.ts`
- **Shared Object File:** `validate_basic_nft.so`  
  (Located in the root directory. If not found, build the project and copy it from `target/`.)


## **Conclusion**
Using bankrun and vitest prove to be a highly efficient and fast method for testing solana smart contracts built with the Codigo tool.
Any further challenges or limitations will be highlited along the line.
