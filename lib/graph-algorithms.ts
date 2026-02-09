import { FamilyTreeData } from '@/lib/types'

interface GraphNode {
    id: string;
    neighbors: Map<string, { relationshipId: string; type: string }>;
}

/**
 * Build an adjacency graph from relationships
 */
export function buildGraph(data: FamilyTreeData): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    // Initialize nodes for all persons
    data.persons.forEach(person => {
        graph.set(person.id, {
            id: person.id,
            neighbors: new Map()
        });
    });

    // Add edges from relationships
    data.relationships.forEach(rel => {
        if (rel.type === 'parent-child' && rel.parent && rel.child) {
            // Add bidirectional edges
            const parentNode = graph.get(rel.parent);
            const childNode = graph.get(rel.child);

            if (parentNode && childNode) {
                const relId = rel.id || `${rel.parent}-${rel.child}`;
                parentNode.neighbors.set(rel.child, { relationshipId: relId, type: 'parent' });
                childNode.neighbors.set(rel.parent, { relationshipId: relId, type: 'child' });
            }
        } else if ((rel.type === 'spouse' || rel.type === 'betrothed') && rel.person1 && rel.person2) {
            const node1 = graph.get(rel.person1);
            const node2 = graph.get(rel.person2);

            if (node1 && node2) {
                const relId = rel.id || `${rel.person1}-${rel.person2}`;
                node1.neighbors.set(rel.person2, { relationshipId: relId, type: rel.type });
                node2.neighbors.set(rel.person1, { relationshipId: relId, type: rel.type });
            }
        }
    });

    return graph;
}

export interface PathStep {
    personId: string;
    relationshipType: string;
    direction: 'to' | 'from';
}

export interface PathResult {
    found: boolean;
    path: PathStep[];
    description: string[];
}

/**
 * Find the shortest path between two persons using BFS
 */
export function findPath(
    data: FamilyTreeData,
    startId: string,
    endId: string,
    graph?: Map<string, GraphNode>
): PathResult {
    if (startId === endId) {
        return { found: true, path: [], description: ['Same person'] };
    }

    const g = graph || buildGraph(data);

    // BFS
    const visited = new Set<string>();
    const queue: { id: string; path: PathStep[] }[] = [{ id: startId, path: [] }];

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.id === endId) {
            // Build description
            const description = buildPathDescription(data, startId, current.path);
            return { found: true, path: current.path, description };
        }

        if (visited.has(current.id)) continue;
        visited.add(current.id);

        const node = g.get(current.id);
        if (!node) continue;

        for (const [neighborId, edge] of node.neighbors) {
            if (!visited.has(neighborId)) {
                const newPath: PathStep[] = [
                    ...current.path,
                    {
                        personId: neighborId,
                        relationshipType: edge.type,
                        direction: 'to'
                    }
                ];
                queue.push({ id: neighborId, path: newPath });
            }
        }
    }

    return { found: false, path: [], description: ['No connection found'] };
}

/**
 * Build human-readable path description
 */
function buildPathDescription(
    data: FamilyTreeData,
    startId: string,
    path: PathStep[]
): string[] {
    const getPersonName = (id: string) => {
        const person = data.persons.find(p => p.id === id);
        return person?.name || id;
    };

    const description: string[] = [];
    let currentId = startId;

    for (const step of path) {
        const currentName = getPersonName(currentId);
        const nextName = getPersonName(step.personId);

        let relation = '';
        switch (step.relationshipType) {
            case 'parent':
                relation = 'parent of';
                break;
            case 'child':
                relation = 'child of';
                break;
            case 'spouse':
                relation = 'married to';
                break;
            case 'betrothed':
                relation = 'betrothed to';
                break;
            default:
                relation = 'related to';
        }

        description.push(`${currentName} → ${relation} → ${nextName}`);
        currentId = step.personId;
    }

    return description;
}

/**
 * Calculate the degree of connection (number of steps) between two persons
 */
export function getConnectionDegree(
    data: FamilyTreeData,
    person1Id: string,
    person2Id: string
): number {
    const result = findPath(data, person1Id, person2Id);
    return result.found ? result.path.length : -1;
}

/**
 * Get all ancestors of a person
 */
export function getAncestors(
    data: FamilyTreeData,
    personId: string,
    maxDepth: number = 10
): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    function traverse(id: string, depth: number) {
        if (depth > maxDepth || visited.has(id)) return;
        visited.add(id);

        // Find parent relationships
        const parentRels = data.relationships.filter(
            rel => rel.type === 'parent-child' && rel.child === id
        );

        for (const rel of parentRels) {
            if (rel.parent && !ancestors.includes(rel.parent)) {
                ancestors.push(rel.parent);
                traverse(rel.parent, depth + 1);
            }
        }
    }

    traverse(personId, 0);
    return ancestors;
}

/**
 * Get all descendants of a person
 */
export function getDescendants(
    data: FamilyTreeData,
    personId: string,
    maxDepth: number = 10
): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();

    function traverse(id: string, depth: number) {
        if (depth > maxDepth || visited.has(id)) return;
        visited.add(id);

        // Find child relationships
        const childRels = data.relationships.filter(
            rel => rel.type === 'parent-child' && rel.parent === id
        );

        for (const rel of childRels) {
            if (rel.child && !descendants.includes(rel.child)) {
                descendants.push(rel.child);
                traverse(rel.child, depth + 1);
            }
        }
    }

    traverse(personId, 0);
    return descendants;
}
