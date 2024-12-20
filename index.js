const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const context = github.context;
    const defaultUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;

    const token = core.getInput("token", {required: true});
    const state = core.getInput("state", {required: true});
    const url = core.getInput("log-url", {required: false}) || defaultUrl;
    const description = core.getInput("description", {required: false});
    const env = core.getInput("environment", {required: false});
    const envUrl = core.getInput("environment-url", {required: false});
    const inputDeploymentId = core.getInput("deployment-id", { required: false });

    const deploymentId = inputDeploymentId
      ? parseInt(inputDeploymentId, 10)
      : context.payload?.deployment?.id;

    if (!deploymentId) {
      core.error(
        "Deployment ID is missing. Please provide it as input or ensure the workflow is triggered by a deployment event."
      );
    }

    const client = new github.getOctokit(token);
    const params = {
      ...context.repo,
      deployment_id: deploymentId,
      state,
      log_url: url,
      target_url: url,
      description,
    };
    if (env) {
      params.environment = env;
    }
    if (envUrl) {
      params.environment_url = envUrl;
    }
    await client.rest.repos.createDeploymentStatus(params);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
