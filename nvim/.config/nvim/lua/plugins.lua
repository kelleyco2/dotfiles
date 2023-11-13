-- TODO: Describe Packer
local ensure_packer = function()
	local fn = vim.fn
	local install_path = fn.stdpath("data") .. "/site/pack/packer/start/packer.nvim"
	if fn.empty(fn.glob(install_path)) > 0 then
		fn.system({ "git", "clone", "--depth", "1", "https://github.com/wbthomason/packer.nvim", install_path })
		vim.cmd([[packadd packer.nvim]])
		return true
	end
	return false
end

local packer_bootstrap = ensure_packer()

return require("packer").startup(function(use)
	-- Packer can manage itself
	use("wbthomason/packer.nvim")

	use({
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
	})

	use({
		"EdenEast/nightfox.nvim",
		config = function()
			vim.o.background = "dark"
			vim.cmd("colorscheme carbonfox")
		end,
	})

	use({
		"nvim-telescope/telescope.nvim",
		requires = { "nvim-lua/plenary.nvim", "nvim-telescope/telescope-symbols.nvim" },
		config = function()
			require("fuzzy")
		end,
	})

	use({
		"numToStr/Comment.nvim",
		config = function()
			require("Comment").setup()
		end,
	})

	use({
		"nvim-treesitter/nvim-treesitter",
		config = function()
			require("treesitter")
		end,
		requires = { "nvim-treesitter/nvim-treesitter-textobjects" },
	})

	use({
		"kylechui/nvim-surround",
		tag = "*", -- Use for stability; omit to use `main` branch for the latest features
		config = function()
			require("nvim-surround").setup({
				-- Configuration here, or leave empty to use defaults
			})
		end,
	})

	use({
		"karb94/neoscroll.nvim",
		config = function()
			require("neoscroll").setup()
		end,
	})

	use({
		"ggandor/leap.nvim",
		config = function()
			require("leap").add_default_mappings()
		end,
	})

	use({
		"sbdchd/neoformat",
		config = function()
			require("formatting")
		end,
	})

	use({
		"neovim/nvim-lspconfig",
		after = "nvim-cmp",
		config = function()
			require("lsp")
		end,
	})

	use({
		"hrsh7th/nvim-cmp",
		requires = {
			"hrsh7th/cmp-nvim-lsp",
			"hrsh7th/cmp-buffer",
			"hrsh7th/cmp-path",
			"hrsh7th/cmp-cmdline",
			"L3MON4D3/LuaSnip",
			"hrsh7th/cmp-nvim-lua",
			"onsails/lspkind-nvim",
		},
		config = function()
			require("complete")
		end,
	})

	use({
		"lukas-reineke/indent-blankline.nvim",
		config = function()
			require("indent")
		end,
		after = { "rainbow-delimiters.nvim" },
	})

	use("christoomey/vim-tmux-navigator")

	use({
		"luukvbaal/nnn.nvim",
		config = function()
			local nnn = require("nnn")
			require("nnn").setup({
				mappings = {
					{ "<C-t>", nnn.builtin.open_in_tab }, -- open file(s) in tab
					{ "<C-x>", nnn.builtin.open_in_split }, -- open file(s) in split
					{ "<C-v>", nnn.builtin.open_in_vsplit }, -- open file(s) in vertical split
				},
			})
		end,
	})

	use("tpope/vim-fugitive")

	use({
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
	})

	use({
		"windwp/nvim-autopairs",
		config = function()
			require("nvim-autopairs").setup()
		end,
	})

	use({
		"roobert/tailwindcss-colorizer-cmp.nvim",
		-- optionally, override the default options:
		config = function()
			require("tailwindcss-colorizer-cmp").setup({
				color_square_width = 2,
			})
		end,
	})

	-- use({
	-- 	"m4xshen/hardtime.nvim",
	-- 	requires = { "MunifTanjim/nui.nvim", "nvim-lua/plenary.nvim" },
	-- 	config = function()
	-- 		require("hardtime").setup()
	-- 	end,
	-- })

	use({
		"HiPhish/rainbow-delimiters.nvim",
		config = function()
			require("rainbow-delimiters.setup").setup()
		end,
	})

	use({
		"windwp/nvim-ts-autotag",
		config = function()
			require("nvim-ts-autotag").setup()
		end,
	})

	use({
		"janko/vim-test",
		requires = {
			"tpope/vim-dispatch",
			"neomake/neomake",
			"preservim/vimux",
		},
		config = function()
			require("testing")
		end,
	})

	if packer_bootstrap then
		require("packer").sync()
	end
end)
