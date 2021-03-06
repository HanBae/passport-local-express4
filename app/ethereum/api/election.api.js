const Election = require('../election');
const Factory = require('../factory');
const timeUtil = require('../../utils/time.util');

const electionState = {
    "0": "대기",
    "1": "진행 중",
    "2": "일시중지",
    "3": "종료"
};

/**
 * Contract Methods
 */

exports.isOwner = async (electionAddress, address) =>
    await Election(electionAddress).methods.isOwner(address).call();

exports.getOwner = async (electionAddress) =>
    await Election(electionAddress).methods.getOwner().call();

exports.getElectionState = async (electionAddress) =>
    await Election(electionAddress).methods.getElectionState().call();

exports.isFiniteElection = async (electionAddress) =>
    await Election(electionAddress).methods.isFiniteElection().call();

exports.getTallyResult = async (electionAddress) =>
    await Election(electionAddress).methods.getTallyResult().call();

exports.getBallot = async (electionAddress, voterAddress) =>
    await Election(electionAddress).methods.getBallot(voterAddress).call();

exports.getBallotCount = async (electionAddress) =>
    await Election(electionAddress).methods.getBallotCount().call();

exports.getPublicKeyOfHe = async (electionAddress) =>
    await Election(electionAddress).methods.getPublicKeyOfHe().call();

exports.getElectionSummary = async (electionAddress) => {
    try {
        const rawSummary = await Election(electionAddress).methods.getElectionSummary().call();
        const startDate = timeUtil.timestampToDate(rawSummary['3']);
        const endDate = timeUtil.timestampToDate(rawSummary['4']);
        return {
            electionName: rawSummary['0'],
            electionDescription: rawSummary['1'],
            electionState: electionState[rawSummary['2']],
            electionAddress: electionAddress,
            startDate: startDate,
            endDate: endDate,
            showDate: `${startDate} - ${endDate}`,
            ballotCount: rawSummary['5'],
            finiteElection: rawSummary['6']
        };
    } catch (e) {
        return {
            electionAddress: undefined
        };
    }
};

exports.setElectionDescription = async (electionAddress, ownerAddress, electionDescription) =>
    await Election(electionAddress).methods.setElectionDescription(electionDescription)
        .send({from: ownerAddress, gas: 1000000});

exports.setElectionState = async (electionAddress, ownerAddress, electionState) =>
    await Election(electionAddress).methods.setElectionState(electionState)
        .send({from: ownerAddress, gas: 1000000});

exports.setElectionDate = async (electionAddress, ownerAddress, startDate, endDate) =>
    await Election(electionAddress).methods.setElectionDate(startDate, endDate)
        .send({from: ownerAddress, gas: 1000000});

exports.setPublicKeyOfHe = async (electionAddress, ownerAddress, publicKeyOfHe) =>
    await Election(electionAddress).methods.setPublicKeyOfHe(publicKeyOfHe)
        .send({from: ownerAddress, gas: 1000000});

exports.setTallyResult = async (electionAddress, ownerAddress, tallyResult) =>
    await Election(electionAddress).methods.setTallyResult(tallyResult)
        .send({from: ownerAddress, gas: 1000000});

exports.vote = async (electionAddress, voterAddress, candidateHash) => {
    const ownerAddress = await Election(electionAddress).methods.getOwner().call();
    // console.log(ownerAddress);
    return await Election(electionAddress).methods.vote(voterAddress, candidateHash)
        .send({from: ownerAddress, gas: 1000000});
};

/**
 * Custom Methods
 */

exports.getElectionSummaryList = async (opts) => {
    let electionAddressList;
    if(opts.isFinite !== undefined) {
        // 보통 목록을 불러올 때
        const isFiniteElection = opts.isFinite;
        electionAddressList = await Factory.methods.getDeployedElections(isFiniteElection).call();
    } else if (opts.electionList !== undefined){
        // MongoDB에서 선거 목록을 불러올 때
        electionAddressList = opts.electionList.map(election => election.address);
    } else {
        return undefined;
    }
    const electionSummaryList = electionAddressList.map(
        (electionAddress) => this.getElectionSummary(electionAddress));
    return Promise.all(electionSummaryList);
};
