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
				dashboard.button("<space><space>", "find file", ":Telescope find_files<CR>"),
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
		priority = 1000,
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
				lualine_x = {
					function()
						local ok, pomo = pcall(require, "pomo")
						if not ok then
							return ""
						end

						local timer = pomo.get_first_to_finish()
						if timer == nil then
							return ""
						end

						return "󰄉 " .. tostring(timer)
					end,
				},
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
			-- Guard: lib.attach in 0.9.1 crashes when get_parser returns nil
			-- (filetypes without an installed parser, e.g. alpha, sosl, prompt).
			local lib = require("rainbow-delimiters.lib")
			local original_attach = lib.attach
			lib.attach = function(bufnr)
				local ft = vim.bo[bufnr].ft
				local lang = vim.treesitter.language.get_lang(ft)
				if not lang then return end
				local ok, parser = pcall(vim.treesitter.get_parser, bufnr, lang)
				if not ok or not parser then return end
				return original_attach(bufnr)
			end
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
	{
		"epwalsh/obsidian.nvim",
		version = "*", -- recommended, use latest release instead of latest commit
		lazy = true,
		ft = "markdown",
		-- Replace the above line with this if you only want to load obsidian.nvim for markdown files in your vault:
		-- event = {
		--   -- If you want to use the home shortcut '~' here you need to call 'vim.fn.expand'.
		--   -- E.g. "BufReadPre " .. vim.fn.expand "~" .. "/my-vault/**.md"
		--   "BufReadPre path/to/my-vault/**.md",
		--   "BufNewFile path/to/my-vault/**.md",
		-- },
		dependencies = {
			-- Required.
			"nvim-lua/plenary.nvim",

			-- see below for full list of optional dependencies 👇
		},
		opts = {
			workspaces = {
				{
					name = "Oracle",
					path = "~/Code/Oracle",
				},
			},
			follow_url_func = function(url)
				-- Open the URL in the default web browser.
				vim.fn.jobstart({ "open", url }) -- Mac OS
				-- vim.fn.jobstart({"xdg-open", url})  -- linux
			end,
		},
	},
	{
		"epwalsh/pomo.nvim",
		version = "*", -- Recommended, use latest release instead of latest commit
		lazy = true,
		cmd = { "TimerStart", "TimerRepeat" },
		dependencies = {
			-- Optional, but highly recommended if you want to use the "Default" timer
			"rcarriga/nvim-notify",
		},
		opts = {
			-- See below for full list of options 👇
			notifiers = {
				{
					name = "Default",
					opts = {
						sticky = false,
					},
				},
			},
		},
	},
	-- {
	-- 	-- Lazy
	-- 	{
	-- 		"jackMort/ChatGPT.nvim",
	-- 		event = "VeryLazy",
	-- 		config = function()
	-- 			local home = vim.fn.expand("$HOME")
	-- 			require("chatgpt").setup({
	-- 				api_key_cmd = "gpg --decrypt " .. home .. "/secret.txt.gpg",
	-- 			})
	-- 		end,
	-- 		dependencies = {
	-- 			"MunifTanjim/nui.nvim",
	-- 			"nvim-lua/plenary.nvim",
	-- 			"nvim-telescope/telescope.nvim",
	-- 		},
	-- 	},
	-- },
}
