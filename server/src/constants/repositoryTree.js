/** Maximum directory nesting depth in the returned file tree (root children = depth 1). */
export const FILE_TREE_MAX_DEPTH = Number(process.env.FILE_TREE_MAX_DEPTH) || 8;

/** Maximum file + directory entries included in the tree before truncation. */
export const FILE_TREE_MAX_NODES = Number(process.env.FILE_TREE_MAX_NODES) || 2000;

/** Marker value for files in the tree. */
export const FILE_TREE_FILE_MARKER = 'file';

/** Marker object when depth or node limits prevent full expansion. */
export const FILE_TREE_TRUNCATED_MARKER = 'truncated';
