const RNGContract = artifacts.require("./RNG.sol");
const BaseGameContract = artifacts.require("./BaseGame.sol");
const HourlyGameContract = artifacts.require("./HourlyGame.sol");
const DailyGameContract = artifacts.require("./DailyGame.sol");
const WeeklyGameContract = artifacts.require("./WeeklyGame.sol");
const MonthlyGameContract = artifacts.require("./MonthlyGame.sol");
const YearlyGameContract = artifacts.require("./YearlyGame.sol");
const JackPotContract = artifacts.require("./JackPot.sol");
const SuperJackPotContract = artifacts.require("./SuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");
const ManagementContract = artifacts.require("./Management.sol");
const TestBaseGameContract = artifacts.require("./TestBaseGame.sol");
const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");
const TestDailyGameContract = artifacts.require("./TestDailyGame.sol");
const TestWeeklyGameContract = artifacts.require("./TestWeeklyGame.sol");
const TestMonthlyGameContract = artifacts.require("./TestMonthlyGame.sol");
const TestYearlyGameContract = artifacts.require("./TestYearlyGame.sol");
const TestJackPotContract = artifacts.require("./TestJackPot.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const RandaoContract = artifacts.require("./Randao.sol");
const AuxContractContract= artifacts.require("./AuxContract.sol");

module.exports = async function(deployer, network, accounts) {
    let BasePeriod = 121;
    let HourlyPeriod = 61;
    let DailyPeriod = 121;
    let WeeklyPeriod = 181;
    let MonthlyPeriod = 240;
    let YearlyPeriod = 300;
    let JackPotPeriod = 61;
    let SuperJackPotPeriod = 61;

    if ( true ||
        network == 'develop'
        || network == 'ganache'
        || network == 'coverage'
    )
    {
        deployer.then(async () => {

            await deployer.deploy(RNGContract, true);
            await deployer.deploy(KYCWhitelistContract);

            await deployer.link(RNGContract, TestBaseGameContract);
            await deployer.link(KYCWhitelistContract, TestBaseGameContract);
            await deployer.deploy(TestBaseGameContract, RNGContract.address, BasePeriod);


            await deployer.link(RNGContract, TestDailyGameContract);
            await deployer.link(KYCWhitelistContract, TestDailyGameContract);
            await deployer.deploy(TestDailyGameContract, RNGContract.address, DailyPeriod);

            await deployer.link(RNGContract, TestWeeklyGameContract);
            await deployer.link(KYCWhitelistContract, TestWeeklyGameContract);
            await deployer.deploy(TestWeeklyGameContract, RNGContract.address, WeeklyPeriod);

            await deployer.link(RNGContract, TestMonthlyGameContract);
            await deployer.link(KYCWhitelistContract, TestMonthlyGameContract);
            await deployer.deploy(TestMonthlyGameContract, RNGContract.address, MonthlyPeriod);

            await deployer.link(RNGContract, TestYearlyGameContract);
            await deployer.link(KYCWhitelistContract, TestYearlyGameContract);
            await deployer.deploy(TestYearlyGameContract, RNGContract.address, YearlyPeriod);

            await deployer.deploy(JackPotCheckerContract);

            await deployer.link(RNGContract, TestJackPotContract);
            await deployer.link(JackPotCheckerContract, TestJackPotContract);
            await deployer.link(KYCWhitelistContract, TestJackPotContract);
            await deployer.deploy(TestJackPotContract, RNGContract.address, JackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, TestSuperJackPotContract);
            await deployer.link(JackPotCheckerContract, TestSuperJackPotContract);
            await deployer.link(KYCWhitelistContract, TestSuperJackPotContract);
            await deployer.deploy(TestSuperJackPotContract, RNGContract.address, SuperJackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, TestHourlyGameContract);
            await deployer.link(TestDailyGameContract, TestHourlyGameContract);
            await deployer.link(TestWeeklyGameContract, TestHourlyGameContract);
            await deployer.link(TestMonthlyGameContract, TestHourlyGameContract);
            await deployer.link(TestYearlyGameContract, TestHourlyGameContract);
            await deployer.link(TestJackPotContract, TestHourlyGameContract);
            await deployer.link(TestSuperJackPotContract, TestHourlyGameContract);
            await deployer.link(KYCWhitelistContract, TestHourlyGameContract);
            await deployer.deploy(
                TestHourlyGameContract,
                RNGContract.address,
                HourlyPeriod,
                TestDailyGameContract.address,
                TestWeeklyGameContract.address,
                TestMonthlyGameContract.address,
                TestYearlyGameContract.address,
                TestJackPotContract.address,
                TestSuperJackPotContract.address
            );

            await deployer.link(TestHourlyGameContract, ManagementContract);
            await deployer.link(TestDailyGameContract, ManagementContract);
            await deployer.link(TestWeeklyGameContract, ManagementContract);
            await deployer.link(TestMonthlyGameContract, ManagementContract);
            await deployer.link(TestYearlyGameContract, ManagementContract);
            await deployer.link(TestJackPotContract, ManagementContract);
            await deployer.link(TestSuperJackPotContract, ManagementContract);
            await deployer.deploy(
                ManagementContract,
                TestHourlyGameContract.address,
                TestDailyGameContract.address,
                TestWeeklyGameContract.address,
                TestMonthlyGameContract.address,
                TestYearlyGameContract.address,
                TestJackPotContract.address,
                TestSuperJackPotContract.address
            );

            await deployer.link(RNGContract, RandaoContract);
            await deployer.deploy(RandaoContract);

            await deployer.deploy(AuxContractContract);

            return console.log('Contracts are deployed in test network!');
        });
    } else {
        deployer.then(async () => {

            await deployer.deploy(RNGContract);
            await deployer.deploy(KYCWhitelistContract);

            await deployer.link(RNGContract, BaseGameContract);
            await deployer.link(KYCWhitelistContract, BaseGameContract);
            await deployer.deploy(BaseGameContract, RNGContract.address, BasePeriod);

            await deployer.link(RNGContract, DailyGameContract);
            await deployer.link(KYCWhitelistContract, DailyGameContract);
            await deployer.deploy(DailyGameContract, RNGContract.address, DailyPeriod);

            await deployer.link(RNGContract, WeeklyGameContract);
            await deployer.link(KYCWhitelistContract, WeeklyGameContract);
            await deployer.deploy(WeeklyGameContract, RNGContract.address, WeeklyPeriod);

            await deployer.link(RNGContract, MonthlyGameContract);
            await deployer.link(KYCWhitelistContract, MonthlyGameContract);
            await deployer.deploy(MonthlyGameContract, RNGContract.address, MonthlyPeriod);

            await deployer.link(RNGContract, YearlyGameContract);
            await deployer.link(KYCWhitelistContract, YearlyGameContract);
            await deployer.deploy(YearlyGameContract, RNGContract.address, YearlyPeriod);

            await deployer.deploy(JackPotCheckerContract);

            await deployer.link(RNGContract, SuperJackPotContract);
            await deployer.link(KYCWhitelistContract, SuperJackPotContract);
            await deployer.deploy(SuperJackPotContract, RNGContract.address, JackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, HourlyGameContract);
            await deployer.link(DailyGameContract, HourlyGameContract);
            await deployer.link(WeeklyGameContract, HourlyGameContract);
            await deployer.link(MonthlyGameContract, HourlyGameContract);
            await deployer.link(YearlyGameContract, HourlyGameContract);
            await deployer.link(SuperJackPotContract, HourlyGameContract);
            await deployer.link(KYCWhitelistContract, HourlyGameContract);
            await deployer.deploy(
                HourlyGameContract,
                RNGContract.address,
                HourlyPeriod,
                DailyGameContract.address,
                WeeklyGameContract.address,
                MonthlyGameContract.address,
                YearlyGameContract.address,
                SuperJackPotContract.address
            );

            await deployer.link(HourlyGameContract, ManagementContract);
            await deployer.link(DailyGameContract, ManagementContract);
            await deployer.link(WeeklyGameContract, ManagementContract);
            await deployer.link(MonthlyGameContract, ManagementContract);
            await deployer.link(YearlyGameContract, ManagementContract);
            await deployer.link(SuperJackPotContract, ManagementContract);
            await deployer.deploy(
                ManagementContract,
                HourlyGameContract.address,
                DailyGameContract.address,
                WeeklyGameContract.address,
                MonthlyGameContract.address,
                YearlyGameContract.address,
                SuperJackPotContract.address
            );

            await deployer.link(RNGContract, RandaoContract);
            await deployer.deploy(RandaoContract);

            return console.log('Contracts are deployed in real network!');
        });
    }



};
