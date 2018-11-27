Deploy encapsulates a lot of logic. From a high level, deploy is a write operaton on two types of resources: lambda functions and s3 buckets. Deploy functionality is primarily implemented in `lambda-one` for lambda functions and `public` for s3 operations. `lambda-all` implements a batched queue that writes lambdas as fast as the aws console will allow. Failed deployments are caught and `create` will be called for anything defined by `.arc` that does not have corosponding local code or remote infra.