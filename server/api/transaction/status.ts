import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { Static, Type } from "@sinclair/typebox";
import { createCustomError } from "../../../core/error/customError";
import { standardResponseSchema } from "../../helpers/sharedApiSchemas";
import { findTxDetailsWithQueueId } from "../../helpers";
import { transactionResponseSchema } from "../../schemas/transaction";

// INPUT
const requestSchema = Type.Object({
  tx_queue_id: Type.String({
    description: "Transaction Queue ID",
    examples: ["9eb88b00-f04f-409b-9df7-7dcc9003bc35"],
  }),
});

// OUTPUT
export const responseBodySchema = Type.Object({
  result: transactionResponseSchema,
});

responseBodySchema.example = {
  result: {
    queueId: "d09e5849-a262-4f0f-84be-55389c6c7bce",
    walletAddress: "0x1946267d81fb8adeeea28e6b98bcd446c8248473",
    contractAddress: "0x365b83d67d5539c6583b9c0266a548926bf216f4",
    chainId: "80001",
    extension: "non-extension",
    functionName: "transfer",
    functionArgs: "0x3EcDBF3B911d0e9052b64850693888b008e18373,1000000",
    status: "submitted",
    encodedInputData:
      "0xa9059cbb0000000000000000000000003ecdbf3b911d0e9052b64850693888b008e1837300000000000000000000000000000000000000000000000000000000000f4240",
    txType: 2,
    gasPrice: "",
    gasLimit: "46512",
    maxPriorityFeePerGas: "1500000000",
    maxFeePerGas: "1500000032",
    txHash:
      "0x6b63bbe29afb2813e8466c0fc48b22f6c2cc835de8b5fd2d9815c28f63b2b701",
    submittedTxNonce: 562,
    createdTimestamp: "2023-06-01T18:56:50.787Z",
    txSubmittedTimestamp: "2023-06-01T18:56:54.908Z",
  },
};

// OUTPUT

export async function checkTxStatus(fastify: FastifyInstance) {
  fastify.route<{
    Params: Static<typeof requestSchema>;
    Reply: Static<typeof responseBodySchema>;
  }>({
    method: "GET",
    url: "/transaction/status/:tx_queue_id",
    schema: {
      description: "Get Submitted Transaction Status",
      tags: ["Transaction"],
      operationId: "txStatus",
      params: requestSchema,
      response: {
        ...standardResponseSchema,
        [StatusCodes.OK]: responseBodySchema,
      },
    },
    handler: async (request, reply) => {
      const { tx_queue_id } = request.params;
      const returnData = await findTxDetailsWithQueueId(tx_queue_id, request);

      if (!returnData) {
        const error = createCustomError(
          `Transaction not found with queueId ${tx_queue_id}`,
          StatusCodes.NOT_FOUND,
          "TX_NOT_FOUND",
        );
        throw error;
      }

      reply.status(StatusCodes.OK).send({
        result: returnData,
      });
    },
  });
}