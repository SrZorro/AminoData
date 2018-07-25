import "dotenv/config";
import AminoClient from "aminoclient";
import Community from "./Community";
import { info } from "./Log";

async function init() {
    info("Start login");
    await AminoClient.login(process.env.AMINO_EMAIL as string, process.env.AMINO_PWD as string, process.env.AMINO_DEVICEID as string);
    info("Logged");
    // info("Connecting to DB");
    // await Mongo.Init();
    info("Connected");

    const comm = await AminoClient.getJoinedCommunities(0, 5);

    const communities: Community[] = [];

    comm.communityList.forEach((community) => {
        communities.push(new Community(community.ndcId));
    });
}
init();