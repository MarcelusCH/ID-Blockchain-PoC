geth --datadir='D:\geth\Data\rinkebyArchive' init D:\geth\Data\rinkebyArchive\rinkeby.json

geth --networkid=4 --datadir='D:\geth\Data\rinkebyArchive' --cache=1024 --syncmode=full --ethstats='mbtest_0912376544:Respect my authoritah!@stats.rinkeby.io' --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303 --verbosity=6

geth --networkid=4 --datadir='D:\geth\Data\rinkebyArchive' --cache=1024 --syncmode=full --ethstats='yournode:Respect my authoritah!@stats.rinkeby.io' --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303 --verbosity=6 --rpcapi='personal,eth,network,web3,net'


geth --rinkeby --rpc --rpcapi="personal,eth,network,web3,net" --datadir="D:\geth\Data\rinkeby" --syncmode=full --ethstats='yourMBtestDEV123456789node:Respect my authoritah!@stats.rinkeby.io' --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303
