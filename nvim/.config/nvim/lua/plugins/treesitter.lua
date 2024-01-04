return {
	{
		"nvim-treesitter/nvim-treesitter",
		opts = {
			-- A list of parser names, or "all" (the five listed parsers should always be installed)
			ensure_installed = "all",

			-- Install parsers synchronously (only applied to `ensure_installed`)
			sync_install = false,

			-- Automatically install missing parsers when entering buffer
			-- Recommendation: set to false if you don't have `tree-sitter` CLI installed locally
			auto_install = true,

			---- If you need to change the installation directory of the parsers (see -> Advanced Setup)
			-- parser_install_dir = "/some/path/to/store/parsers", -- Remember to run vim.opt.runtimepath:append("/some/path/to/store/parsers")!

			highlight = {
				enable = true,
			},
			textobjects = {
				select = {
					enable = true,
					keymaps = {
						-- You can use the capture groups defined in textobjects.scm
						["ic"] = "@comment.inner",
						["ac"] = "@comment.outer",
						["af"] = "@function.outer",
						["if"] = "@function.inner",
						["am"] = "@class.outer",
						["im"] = "@class.inner",
						["ib"] = "@block.inner",
						["ab"] = "@block.outer",
					},
				},
				move = {
					enable = true,
					set_jumps = false,
					goto_next_start = {
						["]]"] = "@function.outer",
					},
					goto_next_end = {
						["]["] = "@function.outer",
					},
					goto_previous_start = {
						["[["] = "@function.outer",
					},
					goto_previous_end = {
						["[]"] = "@function.outer",
					},
				},
			},
			autotag = {
				enable = true,
			},
			endwise = {
				enable = true,
			},
		},
		config = function(_, options)
			require("nvim-treesitter.configs").setup(options)
		end,
		dependencies = {
			"nvim-treesitter/nvim-treesitter-textobjects",
			"RRethy/nvim-treesitter-endwise",
			"nvim-ts-autotag",
		},
	},
}
