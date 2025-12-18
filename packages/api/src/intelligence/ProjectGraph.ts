/**
 * Project Graph - AST-based project intelligence system
 * 
 * Maintains a comprehensive graph of the project structure, code relationships,
 * and patterns for enhanced AI context awareness
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface ASTNode {
  id: string;
  type: string;
  name: string;
  filePath: string;
  location: {
    line: number;
    column: number;
  };
  children: string[];
  parents: string[];
  metadata: Record<string, any>;
}

export interface ProjectGraphData {
  nodes: Map<string, ASTNode>;
  edges: Map<string, Set<string>>;
  files: Map<string, string>;
  symbols: Map<string, ASTNode[]>;
}

export class ProjectGraph {
  private graph: ProjectGraphData;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      files: new Map(),
      symbols: new Map()
    };
  }

  /**
   * Build project graph from source files
   */
  async buildGraph(filePatterns: string[] = ['**/*.ts', '**/*.tsx']): Promise<void> {
    const files = this.discoverFiles(filePatterns);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }

    this.buildRelationships();
  }

  /**
   * Analyze a single file and extract AST
   */
  private async analyzeFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    this.graph.files.set(filePath, content);

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    this.visitNode(sourceFile, filePath);
  }

  /**
   * Visit AST node and extract information
   */
  private visitNode(node: ts.Node, filePath: string, parent?: string): void {
    const nodeId = this.generateNodeId(node, filePath);

    if (this.isInterestingNode(node)) {
      const astNode: ASTNode = {
        id: nodeId,
        type: ts.SyntaxKind[node.kind],
        name: this.getNodeName(node),
        filePath,
        location: this.getNodeLocation(node, filePath),
        children: [],
        parents: parent ? [parent] : [],
        metadata: this.extractMetadata(node)
      };

      this.graph.nodes.set(nodeId, astNode);

      // Index by symbol name
      const symbolName = astNode.name;
      if (symbolName) {
        if (!this.graph.symbols.has(symbolName)) {
          this.graph.symbols.set(symbolName, []);
        }
        this.graph.symbols.get(symbolName)!.push(astNode);
      }
    }

    // Recursively visit children
    ts.forEachChild(node, child => {
      this.visitNode(child, filePath, nodeId);
    });
  }

  /**
   * Build relationships between nodes
   */
  private buildRelationships(): void {
    this.graph.nodes.forEach((node, nodeId) => {
      // Find dependencies and references
      const dependencies = this.findDependencies(node);
      
      if (!this.graph.edges.has(nodeId)) {
        this.graph.edges.set(nodeId, new Set());
      }

      dependencies.forEach(dep => {
        this.graph.edges.get(nodeId)!.add(dep);
      });
    });
  }

  /**
   * Query the graph for context
   */
  getContext(symbolName: string, options?: {
    includeReferences?: boolean;
    includeDependencies?: boolean;
    depth?: number;
  }): {
    nodes: ASTNode[];
    related: ASTNode[];
    context: string;
  } {
    const nodes = this.graph.symbols.get(symbolName) || [];
    const related: ASTNode[] = [];
    const depth = options?.depth || 2;

    // Get related nodes
    if (options?.includeReferences || options?.includeDependencies) {
      nodes.forEach(node => {
        const relatedNodes = this.getRelatedNodes(node.id, depth);
        related.push(...relatedNodes);
      });
    }

    // Build context string
    const context = this.buildContextString(nodes, related);

    return { nodes, related, context };
  }

  /**
   * Get all nodes related to a given node
   */
  private getRelatedNodes(nodeId: string, depth: number): ASTNode[] {
    if (depth <= 0) return [];

    const related: ASTNode[] = [];
    const edges = this.graph.edges.get(nodeId) || new Set();

    edges.forEach(targetId => {
      const node = this.graph.nodes.get(targetId);
      if (node) {
        related.push(node);
        if (depth > 1) {
          related.push(...this.getRelatedNodes(targetId, depth - 1));
        }
      }
    });

    return related;
  }

  /**
   * Build context string from nodes
   */
  private buildContextString(nodes: ASTNode[], related: ASTNode[]): string {
    let context = '';

    // Add main nodes
    nodes.forEach(node => {
      context += `${node.type} ${node.name} at ${node.filePath}:${node.location.line}\n`;
    });

    // Add related context
    if (related.length > 0) {
      context += '\nRelated:\n';
      related.slice(0, 5).forEach(node => {
        context += `  - ${node.type} ${node.name}\n`;
      });
    }

    return context;
  }

  /**
   * Update graph when file changes
   */
  async updateFile(filePath: string): Promise<void> {
    // Remove old nodes for this file
    const oldNodes = Array.from(this.graph.nodes.values())
      .filter(n => n.filePath === filePath);
    
    oldNodes.forEach(n => this.graph.nodes.delete(n.id));

    // Re-analyze file
    await this.analyzeFile(filePath);
    this.buildRelationships();
  }

  /**
   * Get graph statistics
   */
  getStatistics(): {
    totalNodes: number;
    totalEdges: number;
    filesAnalyzed: number;
    symbols: number;
  } {
    let totalEdges = 0;
    this.graph.edges.forEach(edges => {
      totalEdges += edges.size;
    });

    return {
      totalNodes: this.graph.nodes.size,
      totalEdges,
      filesAnalyzed: this.graph.files.size,
      symbols: this.graph.symbols.size
    };
  }

  // Helper methods
  private discoverFiles(patterns: string[]): string[] {
    // Simple file discovery (in production, use glob)
    const files: string[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      });
    };

    walk(this.projectRoot);
    return files;
  }

  private generateNodeId(node: ts.Node, filePath: string): string {
    const position = node.getStart();
    return `${filePath}:${position}`;
  }

  private isInterestingNode(node: ts.Node): boolean {
    return (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isMethodDeclaration(node)
    );
  }

  private getNodeName(node: ts.Node): string {
    if ('name' in node && node.name) {
      return (node.name as any).text || '';
    }
    return '';
  }

  private getNodeLocation(node: ts.Node, filePath: string): { line: number; column: number } {
    const sourceFile = node.getSourceFile();
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return {
      line: position.line + 1,
      column: position.character + 1
    };
  }

  private extractMetadata(node: ts.Node): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (ts.isFunctionDeclaration(node)) {
      metadata.parameters = node.parameters.length;
      metadata.async = !!(node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword));
    }

    if (ts.isClassDeclaration(node)) {
      metadata.members = node.members.length;
    }

    return metadata;
  }

  private findDependencies(node: ASTNode): string[] {
    // Find dependencies by analyzing imports and references
    // Simplified implementation
    return [];
  }
}
