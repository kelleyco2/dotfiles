return {
	{
		"goolord/alpha-nvim",
		config = function()
			local alpha = require("alpha")
			local dashboard = require("alpha.themes.dashboard")

			-- Set Header
			dashboard.section.header.val = {
				[[ █████╗ ██╗     ██╗    ██╗ █████╗ ██╗   ██╗███████╗    ██████╗  ██████╗]],
				[[██╔══██╗██║     ██║    ██║██╔══██╗╚██╗ ██╔╝██╔════╝    ██╔══██╗██╔═══██╗]],
				[[███████║██║     ██║ █╗ ██║███████║ ╚████╔╝ ███████╗    ██║  ██║██║   ██║]],
				[[██╔══██║██║     ██║███╗██║██╔══██║  ╚██╔╝  ╚════██║    ██║  ██║██║   ██║]],
				[[██║  ██║███████╗╚███╔███╔╝██║  ██║   ██║   ███████║    ██████╔╝╚██████╔╝]],
				[[╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═════╝  ╚═════╝]],
				[[██╗   ██╗ ██████╗ ██╗   ██╗██████╗     ██████╗ ███████╗███████╗████████╗██╗]],
				[[╚██╗ ██╔╝██╔═══██╗██║   ██║██╔══██╗    ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║]],
				[[ ╚████╔╝ ██║   ██║██║   ██║██████╔╝    ██████╔╝█████╗  ███████╗   ██║   ██║]],
				[[  ╚██╔╝  ██║   ██║██║   ██║██╔══██╗    ██╔══██╗██╔══╝  ╚════██║   ██║   ╚═╝]],
				[[   ██║   ╚██████╔╝╚██████╔╝██║  ██║    ██████╔╝███████╗███████║   ██║   ██╗]],
				[[   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝]],
			}

			-- Set menu
			dashboard.section.buttons.val = {
				dashboard.button("<space><space>", "find files", ":Telescope find_files<CR>"),
				dashboard.button("?", "Learn Base", ":e init.lua<CR>"),
			}

			alpha.setup(dashboard.opts)
		end,
	},
	{
		"EdenEast/nightfox.nvim",
		config = function()
			vim.o.background = "dark"
			vim.cmd("colorscheme carbonfox")
		end,
		dependencies = {
			"lualine.nvim",
		},
	},
	{
		"nvim-lualine/lualine.nvim",
		opts = {
			options = {
				component_separators = { left = "", right = "" },
				section_separators = { left = "", right = "" },
			},
			sections = {
				lualine_a = {},
				lualine_b = { "diff" },
				lualine_c = { { "filename", path = 3 } },
				lualine_x = {},
				lualine_y = { "filetype" },
				lualine_z = { "location" },
			},
		},
	},
	{
		"rcarriga/nvim-notify",
		config = function()
			vim.notify = require("notify")
		end,
	},
	{
		"HiPhish/rainbow-delimiters.nvim",
		config = function()
			require("rainbow-delimiters.setup").setup()
		end,
	},
	{
		"folke/which-key.nvim",
		config = function()
			vim.o.timeout = true
			vim.o.timeoutlen = 300
			require("which-key").setup({
				-- your configuration comes here
				-- or leave it empty to use the default settings
				-- refer to the configuration section below
			})
		end,
	},
	{
		"lukas-reineke/indent-blankline.nvim",
		config = function()
			local palette = require("nightfox.palette").load("carbonfox")
			local highlight = {
				"RainbowRed",
				"RainbowYellow",
				"RainbowBlue",
				"RainbowOrange",
				"RainbowGreen",
				"RainbowViolet",
				"RainbowCyan",
			}
			local hooks = require("ibl.hooks")
			-- create the highlight groups in the highlight setup hook, so they are reset
			-- every time the colorscheme changes
			hooks.register(hooks.type.HIGHLIGHT_SETUP, function()
				vim.api.nvim_set_hl(0, "RainbowRed", { fg = palette.red.base })
				vim.api.nvim_set_hl(0, "RainbowYellow", { fg = palette.yellow.base })
				vim.api.nvim_set_hl(0, "RainbowBlue", { fg = palette.blue.base })
				vim.api.nvim_set_hl(0, "RainbowOrange", { fg = palette.orange.base })
				vim.api.nvim_set_hl(0, "RainbowGreen", { fg = palette.green.base })
				vim.api.nvim_set_hl(0, "RainbowViolet", { fg = palette.magenta.base })
				vim.api.nvim_set_hl(0, "RainbowCyan", { fg = palette.cyan.base })
			end)

			vim.g.rainbow_delimiters = { highlight = highlight }
			require("ibl").setup({ scope = { highlight = highlight } })

			hooks.register(hooks.type.SCOPE_HIGHLIGHT, hooks.builtin.scope_highlight_from_extmark)
		end,
		dependencies = { "rainbow-delimiters.nvim", "nightfox.nvim" },
		lazy = true,
		event = "VeryLazy",
	},
	{
		"akinsho/bufferline.nvim",
		version = "*",
		config = function()
			require("bufferline").setup({
				options = {
					diagnostics = "nvim_lsp",
					separator_style = "slope",
					show_buffer_close_icons = false,
				},
			})
		end,
		dependencies = "nvim-tree/nvim-web-devicons",
	},
}
