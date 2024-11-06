return {
	{
		"karb94/neoscroll.nvim",
		config = true,
	},
	{
		"ggandor/leap.nvim",
		config = function()
			local leap = require("leap")
			leap.add_default_mappings()
			leap.opts.safe_labels = {}
		end,
	},
	{
		"kylechui/nvim-surround",
		version = "*", -- Use for stability; omit to use `main` branch for the latest features
		event = "VeryLazy",
		config = true,
	},
	{
		"numToStr/Comment.nvim",
		config = true,
	},
	{
		"mfussenegger/nvim-lint",
		config = function()
			local lint = require("lint")

			lint.linters_by_ft = {
				elixir = { "credo" },
			}

			local group = vim.api.nvim_create_augroup("MyLinter", {})

			vim.api.nvim_create_autocmd({ "BufWritePost", "BufEnter" }, {
				pattern = { "*.ex", "*.exs" },
				callback = function()
					lint.try_lint()
				end,
				group = group,
			})
		end,
	},
	{
		"sbdchd/neoformat",
		init = function()
			-- Force specific formatting engines
			vim.g.neoformat_enabled_typescript = { "prettier" }
			vim.g.neoformat_enabled_javascript = { "prettier" }
			vim.g.neoformat_enabled_json = { "prettier" }
			vim.g.neoformat_enabled_css = { "prettier" }
			vim.g.neoformat_enabled_markdown = { "prettier" }
			vim.g.neoformat_enabled_html = { "prettier" }
			vim.g.neoformat_enabled_html = { "prettier" }
			vim.g.neoformat_enabled_svelte = { "prettierd" }
			vim.g.neoformat_enabled_lua = { "stylua" }
			vim.g.neoformat_enabled_elixir = { "mixformat" }
		end,
	},
	"christoomey/vim-tmux-navigator",
	{
		"windwp/nvim-autopairs",
		config = true,
	},
	{
		"windwp/nvim-ts-autotag",
		config = function()
			require("nvim-ts-autotag").setup()
		end,
		ft = { "javascript", "typescript", "typescriptreact" },
	},
	{
		"dmmulroy/tsc.nvim",
		opts = {
			auto_focus_qflist = true,
		},
	},
	{
		"andrewferrier/debugprint.nvim",
		opts = {
			display_snippet = false,
			print_tag = "DEBUG",
		},
		config = function(_, opts)
			require("debugprint").setup(opts)

			vim.keymap.set("n", "<Leader>lg", function()
				-- Note: setting `expr=true` and returning the value are essential
				return require("debugprint").debugprint()
			end, {
				expr = true,
			})

			vim.keymap.set("n", "<Leader>Lg", function()
				-- Note: setting `expr=true` and returning the value are essential
				return require("debugprint").debugprint({ above = true })
			end, {
				expr = true,
			})

			vim.keymap.set("n", "<Leader>lv", function()
				-- Note: setting `expr=true` and returning the value are essential
				return require("debugprint").debugprint({ variable = true })
			end, {
				expr = true,
			})

			vim.keymap.set("n", "<Leader>Lv", function()
				-- Note: setting `expr=true` and returning the value are essential
				return require("debugprint").debugprint({ above = true, variable = true })
			end, {
				expr = true,
			})

			-- vim.api.nvim_create_user_command("DeleteDebugs", function(opts)
			-- 	-- Note: you must set `range=true` and pass through opts for ranges to work
			-- 	M.deleteprints(opts)
			-- end, {
			-- 	range = true,
			-- })

			vim.keymap.set("n", "<Leader>kl", "<CMD>DeleteDebugPrints<CR>")
		end,
	},
	{
		"NvChad/nvim-colorizer.lua",
		opts = {
			user_default_options = {
				mode = "virtualtext",
				names = false,
			},
		},
	},
	{
		"tmillr/sos.nvim",
		config = function()
			require("sos").setup()
		end,
	},
}
