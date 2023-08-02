-- TODO: Describe Packer
local ensure_packer = function()
	local fn = vim.fn
	local install_path = fn.stdpath('data')..'/site/pack/packer/start/packer.nvim'
	if fn.empty(fn.glob(install_path)) > 0 then
	  fn.system({'git', 'clone', '--depth', '1', 'https://github.com/wbthomason/packer.nvim', install_path})
	  vim.cmd [[packadd packer.nvim]]
	  return true
	end
	return false
  end
  
  local packer_bootstrap = ensure_packer()
  
  return require('packer').startup(function(use)
	-- Packer can manage itself
	use 'wbthomason/packer.nvim'
  
	use {
	  'goolord/alpha-nvim',
	  config = function ()
		local alpha = require('alpha')
			  local dashboard = require('alpha.themes.dashboard')
  
			  -- Set Header
			  dashboard.section.header.val = {
		  '██████╗  █████╗ ███████╗███████╗██╗     ██╗███╗   ██╗███████╗',
				  '██╔══██╗██╔══██╗██╔════╝██╔════╝██║     ██║████╗  ██║██╔════╝',
				  '██████╔╝███████║███████╗█████╗  ██║     ██║██╔██╗ ██║█████╗  ',
				  '██╔══██╗██╔══██║╚════██║██╔══╝  ██║     ██║██║╚██╗██║██╔══╝  ',
				  '██████╔╝██║  ██║███████║███████╗███████╗██║██║ ╚████║███████╗',
				  '╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝'
			  }
  
			  -- Set menu
			  dashboard.section.buttons.val = {
				  dashboard.button('<space><space>', 'find files', ':Telescope find_files<CR>'),
		  dashboard.button('?', 'Learn Base', ':e init.lua<CR>')
			  }
  
			  alpha.setup(dashboard.opts)
	  end
	}

	use {
	  'EdenEast/nightfox.nvim',
	  config = function()
		vim.o.background = 'dark'
		vim.cmd('colorscheme carbonfox')
	  end
	}

  
	use {
	  'nvim-telescope/telescope.nvim',
	  requires = {'nvim-lua/plenary.nvim'},
		config = function()
	  		require('fuzzy')
	  end
	}
  
	use {
	  'numToStr/Comment.nvim',
	  config = function()
		  require('Comment').setup()
	  end
	}
  
	use {
		'nvim-treesitter/nvim-treesitter',
		config = function()
			require('treesitter')
		end,
		requires = { 'nvim-treesitter/nvim-treesitter-textobjects' }
	}
  
	use {
		"kylechui/nvim-surround",
		tag = "*", -- Use for stability; omit to use `main` branch for the latest features
		config = function()
			require("nvim-surround").setup({
				-- Configuration here, or leave empty to use defaults
			})
	end
	}

	use {
		'karb94/neoscroll.nvim',
		config = function()
			require("neoscroll").setup()
		end
	}

	use {
		'ggandor/leap.nvim',
		config = function()
			require('leap').add_default_mappings()
		end
	}
  
	  if packer_bootstrap then
	  require('packer').sync()
	end
  end)
