import Agenda from "agenda";
import config from ".";

const agenda = new Agenda({
    db: { address: `${config.database_url}/thera`, collection: "agendaJobs" }
});

agenda.on("ready", () => console.log("Agenda connected and ready!"));

export default agenda;
