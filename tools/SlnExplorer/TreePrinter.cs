namespace SlnExplorer;

public static class TreePrinter
{
    public static void Print(ExplorerNode root)
    {
        Console.WriteLine(Format(root));
        for (var i = 0; i < root.Children.Count; i++)
            Print(root.Children[i], "", i == root.Children.Count - 1);
    }

    private static void Print(ExplorerNode node, string indent, bool last)
    {
        Console.Write(indent);
        Console.Write(last ? "└── " : "├── ");
        Console.WriteLine(Format(node));

        var childIndent = indent + (last ? "    " : "│   ");
        for (var i = 0; i < node.Children.Count; i++)
            Print(node.Children[i], childIndent, i == node.Children.Count - 1);
    }

    private static string Format(ExplorerNode node)
    {
        var status = string.IsNullOrWhiteSpace(node.Status) ? "" : $" [{node.Status}]";
        var warning = string.IsNullOrWhiteSpace(node.Warning) ? "" : $" ⚠ {node.Warning}";
        var props = node.Properties.Count == 0
            ? ""
            : " {" + string.Join(", ", node.Properties.Select(kv => $"{kv.Key}={kv.Value}")) + "}";
        return $"{node.Name} ({node.Type}){status}{props}{warning}";
    }
}
