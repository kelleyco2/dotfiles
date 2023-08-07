-- vim.opt.list = true
-- vim.opt.listchars:append("space:⋅")
-- vim.opt.listchars:append("eol:↴")

require("indent_blankline").setup({
	char = "",
	context_char = "│",
	space_char_blankline = " ",
	show_current_context = true,
	show_current_context_start = false,
	strict_tabs = true,
	use_treesitter = true,
	-- context_patterns = { "class", "function", "method" },
	-- filetype_exclude = { "help", "packer", "nvimtree", "dashboard", "neo-tree" },
	-- buftype_exclude = { "terminal", "nofile", "quickfix" },
	-- show_current_context_start = true,
})
