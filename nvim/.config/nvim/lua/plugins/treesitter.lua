local ensure_installed = {
	"apex",
	"bash",
	"comment",
	"css",
	"diff",
	"dockerfile",
	"eex",
	"elixir",
	"gitcommit",
	"gitignore",
	"heex",
	"html",
	"javascript",
	"jsdoc",
	"json",
	"json5",
	"lua",
	"markdown",
	"markdown_inline",
	"query",
	"regex",
	"scss",
	"toml",
	"tsx",
	"typescript",
	"vim",
	"vimdoc",
	"yaml",
}

return {
	{
		"nvim-treesitter/nvim-treesitter",
		branch = "main",
		lazy = false,
		build = ":TSUpdate",
		config = function()
			require("nvim-treesitter").setup()

			local installed = require("nvim-treesitter.config").get_installed("parsers")
			local missing = vim.tbl_filter(function(p)
				return not vim.tbl_contains(installed, p)
			end, ensure_installed)
			if #missing > 0 then
				require("nvim-treesitter").install(missing)
			end

			vim.api.nvim_create_autocmd("FileType", {
				callback = function(ev)
					if not pcall(vim.treesitter.start, ev.buf) then
						return
					end
					vim.bo[ev.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
					vim.wo.foldexpr = "v:lua.vim.treesitter.foldexpr()"
					vim.wo.foldmethod = "expr"
				end,
			})
		end,
	},
	{
		"nvim-treesitter/nvim-treesitter-textobjects",
		branch = "main",
		dependencies = { "nvim-treesitter/nvim-treesitter" },
		event = "VeryLazy",
		config = function()
			require("nvim-treesitter-textobjects").setup({})
			local select = require("nvim-treesitter-textobjects.select")
			local move = require("nvim-treesitter-textobjects.move")

			local function sel(query)
				return function()
					select.select_textobject(query, "textobjects")
				end
			end

			vim.keymap.set({ "x", "o" }, "ic", sel("@comment.inner"))
			vim.keymap.set({ "x", "o" }, "ac", sel("@comment.outer"))
			vim.keymap.set({ "x", "o" }, "if", sel("@function.inner"))
			vim.keymap.set({ "x", "o" }, "af", sel("@function.outer"))
			vim.keymap.set({ "x", "o" }, "im", sel("@class.inner"))
			vim.keymap.set({ "x", "o" }, "am", sel("@class.outer"))
			vim.keymap.set({ "x", "o" }, "ib", sel("@block.inner"))
			vim.keymap.set({ "x", "o" }, "ab", sel("@block.outer"))

			vim.keymap.set({ "n", "x", "o" }, "]]", function()
				move.goto_next_start("@function.outer", "textobjects")
			end)
			vim.keymap.set({ "n", "x", "o" }, "][", function()
				move.goto_next_end("@function.outer", "textobjects")
			end)
			vim.keymap.set({ "n", "x", "o" }, "[[", function()
				move.goto_previous_start("@function.outer", "textobjects")
			end)
			vim.keymap.set({ "n", "x", "o" }, "[]", function()
				move.goto_previous_end("@function.outer", "textobjects")
			end)
		end,
	},
	{
		"RRethy/nvim-treesitter-endwise",
		dependencies = { "nvim-treesitter/nvim-treesitter" },
		event = "InsertEnter",
	},
}
