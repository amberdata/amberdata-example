# amberdata-example

## Cloning the repository

To clone this repository, run the following command:

    git clone https://github.com/amberdata/amberdata-example
    cd amberdata-example

Then/Or, to get the latest updates:

    git pull && git submodule update --init --recursive --remote

## Adding new submodules

To add a new sub-module, run the following command:

    git submodule add https://github.com/<organization_name>/<repository_name> <repository_name>

For example:

    git submodule add https://github.com/amberdata/amberdata-example-dapp         amberdata-example-dapp
    git submodule add https://github.com/amberdata/amberdata-example-erc20-wallet amberdata-example-erc20-wallet
    git submodule add https://github.com/amberdata/amberdata-example-gas-station  amberdata-example-gas-station
    git submodule add https://github.com/amberdata/amberdata-example-wallet       amberdata-example-wallet

After running the command(s) above, the submodules will have been added to the `.gitmodules` file, and the changes are ready to be commited:

    git commit -m "added the new sub-module <repository_name>"
    git push

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
