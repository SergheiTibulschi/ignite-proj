import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const CodeStoreModel = types
  .model("CodeStore")
  .props({})
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CodeStore extends Instance<typeof CodeStoreModel> {}
export interface CodeStoreSnapshotOut extends SnapshotOut<typeof CodeStoreModel> {}
export interface CodeStoreSnapshotIn extends SnapshotIn<typeof CodeStoreModel> {}
export const createCodeStoreDefaultModel = () => types.optional(CodeStoreModel, {})
