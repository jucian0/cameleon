import dotProp from "dot-prop-immutable";
import type { CamelConfig, StepType } from "./topology-types";

type StructuralBranchRule = {
  minCount: number;
  canReplace: boolean;
};

type StructuralBranchDescriptor = {
  branchType: StepType;
  siblingPath: string;
  isCollection: boolean;
};

export type StructuralBranchCapability = {
  isStructural: boolean;
  canDelete: boolean;
  canReplace: boolean;
  siblingCount?: number;
  minCount?: number;
  reason?: string;
};

const STRUCTURAL_BRANCH_RULES: Partial<Record<StepType, StructuralBranchRule>> =
  {
    when: {
      minCount: 1,
      canReplace: false,
    },
    otherwise: {
      minCount: 1,
      canReplace: false,
    },
    doCatch: {
      minCount: 1,
      canReplace: false,
    },
    doFinally: {
      minCount: 1,
      canReplace: false,
    },
    fallback: {
      minCount: 0,
      canReplace: false,
    },
  };

function getStructuralBranchDescriptor(
  stepType: StepType,
  absolutePath: string,
): StructuralBranchDescriptor | null {
  switch (stepType) {
    case "when":
      return {
        branchType: stepType,
        siblingPath: absolutePath.replace(/\.when\.\d+$/, ".when"),
        isCollection: true,
      };
    case "otherwise":
      return {
        branchType: stepType,
        siblingPath: absolutePath,
        isCollection: false,
      };
    case "doCatch":
      return {
        branchType: stepType,
        siblingPath: absolutePath.replace(/\.doCatch\.\d+$/, ".doCatch"),
        isCollection: true,
      };
    case "doFinally":
      return {
        branchType: stepType,
        siblingPath: absolutePath,
        isCollection: false,
      };
    case "fallback":
      return {
        branchType: stepType,
        siblingPath: absolutePath,
        isCollection: false,
      };
    default:
      return null;
  }
}

export function getStructuralBranchCapability(
  camelConfig: CamelConfig,
  absolutePath: string,
  stepType: StepType,
): StructuralBranchCapability {
  const descriptor = getStructuralBranchDescriptor(stepType, absolutePath);
  if (!descriptor) {
    return {
      isStructural: false,
      canDelete: true,
      canReplace: true,
    };
  }

  const rule = STRUCTURAL_BRANCH_RULES[descriptor.branchType];
  if (!rule) {
    return {
      isStructural: false,
      canDelete: true,
      canReplace: true,
    };
  }

  const siblingCount = descriptor.isCollection
    ? Array.isArray(dotProp.get(camelConfig, descriptor.siblingPath))
      ? (dotProp.get(camelConfig, descriptor.siblingPath, []) as unknown[])
          .length
      : 0
    : dotProp.get(camelConfig, descriptor.siblingPath) != null
      ? 1
      : 0;

  const canDelete = siblingCount > rule.minCount;

  return {
    isStructural: true,
    canDelete,
    canReplace: rule.canReplace,
    siblingCount,
    minCount: rule.minCount,
    reason: canDelete
      ? undefined
      : `This ${stepType} branch is required by the current operator structure.`,
  };
}
